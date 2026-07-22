import { SetMetadata } from '@nestjs/common';
import { BYPASS_TRANSFORM_METADATA_KEY } from '../constants';

export const BypassTransform = () => SetMetadata(BYPASS_TRANSFORM_METADATA_KEY, true);
