export type InstrumentType = {
  domainId: string,
  name: string,
  measurementUnits: InstrumentTypeMeasurementUnit[],
}

export type InstrumentTypeMeasurementUnit = {
  measurementUnit: MeasurementUnit,
  instrumentType: InstrumentType,
}

export type ClientInstrumentTemplate = {
  domainId: string;
  customName: string;
  instrumentType: InstrumentType,
  clientInstrumentTemplateParameter: ClientInstrumentTemplateParameter[]
};

export type ClientInstrumentTemplateParameter = {
  attentionValue: string;
  alertValue: string;
  domainId: string;
  parameterName: string;
  clientInstrumentTemplate?: ClientInstrumentTemplate;
};

export type MeasurementUnit = {
  name: string;
}