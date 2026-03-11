import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { TrainsService } from '../trains/trains.service';
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
        private readonly alertsGateway: AlertsGateway,
    ) { }

    /** Formate une date en YYYYMMDDTHHmmssZ pour l'API Navitia */
    private formatNavitia(d: Date): string {
        return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async pollDisruptions(): Promise<void> {
        this.logger.log('Polling SNCF disruptions...');

        try {
            const apiKey = this.config.get<string>('SNCF_API_KEY');
            const now = new Date();
            const since = this.formatNavitia(new Date(now.getTime() - 10 * 60 * 1000));
            const until = this.formatNavitia(new Date(now.getTime() + 10 * 60 * 1000));

            const { data } = await firstValueFrom(
                this.http.get(`${this.baseUrl}/disruptions`, {
                    headers: { Authorization: apiKey },
                    params: { count: 100, since, until },
                }),
            );

            const disruptions = data?.disruptions ?? [];
            this.logger.log(`Fetched ${disruptions.length} disruptions`);

            const positions = adaptDisruptions(disruptions);

            if (positions.length > 0) {
                await this.trainsService.saveMany(positions);
                this.logger.log(`Saved ${positions.length} train positions`);
            }

            const latest = await this.trainsService.findLatest();
            this.alertsGateway.emitTrainsUpdate(latest);
        } catch (error) {
            this.logger.error('Failed to poll SNCF API', error?.message);
        }
    }
}
