// These are used in some other plugins for some reason

import {
  escapeStringForRegex,
  FieldOverrideContext,
  getFieldDisplayName,
  PanelOptionsEditorBuilder,
  ReducerID,
  standardEditorsRegistry,
  SelectableValue,
  FieldDisplay,
  FieldType,
  FieldConfigEditorBuilder,
} from '@grafana/data';
import { SingleStatBaseOptions, VizOrientation } from '@grafana/schema';

interface CustomStatFormats {
  prefixes: CustomStatPrefixes;
}

interface CustomStatPrefixes {
  [key: string]: { description: string; symbol: string };
}

export function addStandardDataReduceOptions<T extends SingleStatBaseOptions>(
  builder: PanelOptionsEditorBuilder<T>,
  includeFieldMatcher = true
) {
  const valueOptionsCategory = ['Value options'];

  builder.addRadio({
    path: 'reduceOptions.values',
    name: 'Show',
    description: 'Calculate a single value per column or series or show each row',
    settings: {
      options: [
        { value: false, label: 'Calculate' },
        { value: true, label: 'All values' },
      ],
    },
    category: valueOptionsCategory,
    defaultValue: false,
  });

  builder.addNumberInput({
    path: 'reduceOptions.limit',
    name: 'Limit',
    description: 'Max number of rows to display',
    category: valueOptionsCategory,
    settings: {
      placeholder: '25',
      integer: true,
      min: 1,
      max: 5000,
    },
    showIf: (options) => options.reduceOptions.values === true,
  });

  builder.addCustomEditor({
    id: 'reduceOptions.calcs',
    path: 'reduceOptions.calcs',
    name: 'Calculation',
    description: 'Choose a reducer function / calculation',
    category: valueOptionsCategory,
    editor: standardEditorsRegistry.get('stats-picker').editor,
    // TODO: Get ReducerID from generated schema one day?
    defaultValue: [ReducerID.lastNotNull],
    // Hides it when all values mode is on
    showIf: (currentConfig) => currentConfig.reduceOptions.values === false,
  });

  if (includeFieldMatcher) {
    builder.addSelect({
      path: 'reduceOptions.fields',
      name: 'Fields',
      description: 'Select the fields that should be included in the panel',
      category: valueOptionsCategory,
      settings: {
        allowCustomValue: true,
        options: [],
        getOptions: async (context: FieldOverrideContext) => {
          const options = [
            { value: '', label: 'Numeric Fields' },
            { value: '/.*/', label: 'All Fields' },
          ];
          if (context && context.data) {
            for (const frame of context.data) {
              for (const field of frame.fields) {
                const name = getFieldDisplayName(field, frame, context.data);
                const value = `/^${escapeStringForRegex(name)}$/`;
                options.push({ value, label: name });
              }
            }
          }
          return Promise.resolve(options);
        },
      },
      defaultValue: '',
    });
  }
}

export function addOrientationOption<T extends SingleStatBaseOptions>(
  builder: PanelOptionsEditorBuilder<T>,
  category?: string[]
) {
  builder.addRadio({
    path: 'orientation',
    name: 'Orientation',
    description: 'Layout orientation',
    category,
    settings: {
      options: [
        { value: VizOrientation.Auto, label: 'Auto' },
        { value: VizOrientation.Horizontal, label: 'Horizontal' },
        { value: VizOrientation.Vertical, label: 'Vertical' },
      ],
    },
    defaultValue: VizOrientation.Auto,
  });
}

// Build the SelectableValues for the panel dropdown
export function getSelectablePrefixValues(): SelectableValue[] {
  const selectableFormattingPrefixes = [];
  const prefixOptions = getStatPrefixes().prefixes;

  for (const key in prefixOptions) {
    const selectablePrefix = { value: key, label: prefixOptions[key].description };
    selectableFormattingPrefixes.push(selectablePrefix);
  }

  return selectableFormattingPrefixes;
}

// Custom stat panel prefixes; add more when use cases arise
function getStatPrefixes(): CustomStatFormats {
  return {
    prefixes: {
      remove: { description: 'Remove Custom Prefix', symbol: '' },
      increase: { description: 'Increase (\u2191)', symbol: '\u2191' },
      decrease: { description: 'Decrease (\u2193)', symbol: '\u2193' },
      lessThan: { description: 'Less than (<)', symbol: '<' },
      greaterThan: { description: 'Greater than (>)', symbol: '>' },
      approximately: { description: 'Approximately (~)', symbol: '~' },
      fiscalQuarter: { description: 'Fiscal quarter (FQ)', symbol: 'FQ' },
      quarter: { description: 'Quarter (Qtr)', symbol: 'Qtr' },
      fiscalYear: { description: 'Fiscal year (FY)', symbol: 'FY' },
      delta: { description: 'Delta (\u0394)', symbol: '\u0394' },
      mean: { description: 'Mean (\u00B5)', symbol: '\u00B5' },
    },
  };
}

export function formatValueForCustomPrefix(fieldValues: FieldDisplay[], prefix: string): FieldDisplay[] {
  console.log('🚀 ~ file: common.ts:151 ~ formatValueForCustomPrefix ~ prefix:', prefix);
  // Grab all custom stat panel prefix objects
  const customPrefixes = getStatPrefixes().prefixes;
  // Built list of only the prefix symbols; used for stripping previous symbols when new prefix is chosen
  const prefixList = Object.keys(customPrefixes).map((key) => customPrefixes[key].symbol);
  // The user-chosen stat prefix
  const chosenPrefix = customPrefixes[prefix]?.symbol ?? '';

  // Test all field values for FieldType.number
  return fieldValues.map((fieldValue) => {
    const { fieldType, display } = fieldValue;
    // `FieldType.number` is the only type on which unit formatting is enforced
    if (fieldType === FieldType.number) {
      const previousPrefix = display.prefix ?? '';
      // Strip all previous custom stat formatting
      const strippedPreviousPrefix = stripStringOfValues(previousPrefix, prefixList);
      // Append the new prefix; if `remove` was chosen, `chosenPrefix` will resolve to an empty string
      const updatedPrefix = chosenPrefix + strippedPreviousPrefix;
      // Put everything back together
      const updatedDisplay = { ...display, prefix: updatedPrefix };
      return { ...fieldValue, display: updatedDisplay };
    }
    return fieldValue;
  });
}

function stripStringOfValues(prefixToStrip: string, itemsToStrip: string[]): string {
  // Early return if no prefixes exist
  if (prefixToStrip === '') {
    return prefixToStrip;
  }

  // Test for any previous prefixes and remove them
  for (let i = 0; i < itemsToStrip.length; i++) {
    prefixToStrip = prefixToStrip.replace(new RegExp(itemsToStrip[i], 'g'), '');
  }

  return prefixToStrip;
}
