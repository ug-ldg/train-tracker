import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { TrainsService } from '../trains/trains.service';
import { StressScoreService } from '../stress-score/stress-score.service';
import { AlertsGateway } from '../alerts/alerts.gateway';
import { adaptDisruptions } from './sncf-api.adapter';

@Injectable()
export class PollerService {
    private readonly logger = new Logger(PollerService.name);
    private readonly baseUrl = 'https://api.sncf.com/v1/coverage/sncf';

    constructor(
        private readonly http: HttpService,
        private readonly config: ConfigService,
        private readonly trainsService: TrainsService,
        private readonly stressScoreService: StressScoreService,
        private readonly alertsGateway: AlertsGateway,
    ) { }

    @Cron(CronExpression.EVERY_MINUTE)
    async pollDisruptions(): Promise<void> {
        this.logger.log('Polling SNCF disruptions...');

        try {
            const apiKey = this.config.get<string>('SNCF_API_KEY');
            const { data } = await firstValueFrom(
                this.http.get(`${this.baseUrl}/disruptions`, {
                    headers: { Authorization: apiKey },
                    params: { count: 100 },
                }),
            );

            const disruptions = data?.disruptions ?? [];
            this.logger.log(`Fetched ${disruptions.length} disruptions`);

            // Debug
            // if (disruptions.length > 0) {
            //     this.logger.log(JSON.stringify(disruptions[0], null, 2));
            // }

            const positions = adaptDisruptions(disruptions);


            // Calcul des scores et push WebSocket
            const scores = await this.stressScoreService.computeAll();
            this.alertsGateway.emitStressUpdate(scores);

            // Émet la liste complète des alertes actives (remplace, ne cumule pas)
            const activeAlerts = scores
                .filter((s) => s.level === 'CRITICAL' || s.level === 'HIGH')
                .map((s) => ({
                    lineId: s.lineId,
                    level: s.level,
                    message: `${s.lineName} : retard moyen ${Math.round(s.avgDelaySeconds / 60)} min`,
                }));
            this.alertsGateway.emitActiveAlerts(activeAlerts);

            if (positions.length > 0) {
                await this.trainsService.saveMany(positions);
                this.logger.log(`Saved ${positions.length} train positions`);
                const latest = await this.trainsService.findLatest();
                this.alertsGateway.emitTrainsUpdate(latest);
            }
        } catch (error) {
            this.logger.error('Failed to poll SNCF API', error?.message);
        }
    }
}