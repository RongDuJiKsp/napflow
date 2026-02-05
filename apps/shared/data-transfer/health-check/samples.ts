import z from 'zod'
import { defineZodResp } from '../_base'
import { ZodCheckAggregatedMetrics } from '../../common/health-check/health-check'

export const ZodCheckHealthCheckSamplesResp = defineZodResp(z.array(ZodCheckAggregatedMetrics))
