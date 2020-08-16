import winston from 'winston';

export interface ExtraLogFields {
  campus?: string,
}


export const defaultTransports = [
  new winston.transports.Console({
    silent: process.env.NODE_ENV === 'test',
  }),
];

export const defaultConfig: winston.LoggerOptions = {
  level: 'info',
  format: winston.format.json(),
  defaultMeta: {component: 'image'},
  transports: defaultTransports,
};

export const getLogger = (section?: string, extra?: ExtraLogFields) => {
  return winston.createLogger({
    ...defaultConfig,
    defaultMeta: {...defaultConfig.defaultMeta, ...extra, section},
  });
}
