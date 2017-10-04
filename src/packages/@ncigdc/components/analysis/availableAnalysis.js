import React from 'react';
import { VennSvg } from '@ncigdc/components/Charts/Venn';
import SetOperations from './SetOperations';
import CohortComparison from '@ncigdc/modern_components/CohortComparison';
import CCIcon from '@ncigdc/theme/icons/CohortComparisonIcon';
import { withTheme } from '@ncigdc/theme';
import type { TSetTypes } from '@ncigdc/dux/sets';
import Demo from './Demo';

type TSelectedSets = {
  [TSetTypes]: {},
};

type TAnalysis = {|
  type: string,
  title: string,
  Icon: ReactComponent<*>,
  description: string,
  demoData: {|
    sets: TSelectedSets,
    filters: {},
    type: string,
  |},
  setInstructions: string,
  setDisabledMessage: ({ sets: TSelectedSets, type: string }) => ?string,
  setTypes: Array<string>,
  validateSets: TSelectedSets => boolean,
  ResultComponent: ReactComponent<*>,
|};

const availableAnalysis: Array<TAnalysis> = [
  {
    type: 'set_operations',
    label: 'Set Operations',
    Icon: p => (
      <VennSvg
        {...p}
        data={[1, 2, 3]}
        ops={[
          { op: 1 },
          { op: 2 },
          { op: 3 },
          { op: 4 },
          { op: 5 },
          { op: 6 },
          { op: 7 },
        ]}
        width={85}
        height={100}
        radius={25}
        outlineWidth={1}
        outlineColour="rgba(46, 90, 164, 0.62)"
        getFillColor={(d, i) => {
          if (d.op === 5) return 'rgba(38, 166, 166, 0.65)';
          if (d.op === 6) return 'rgba(235, 233, 46, 0.79)';
          if (d.op === 7) return 'rgba(175, 58, 215, 0.8)';
          return 'rgba(0,0,0,0)';
        }}
      />
    ),
    description:
      'Display Venn diagram and find intersection or union, etc. of your sets of the same type.',
    demoData: {
      sets: {
        case: {
          'demo-bladder-high-mutect': 'Bladder, High impact, Mutect',
          'demo-bladder-high-varscan': 'Bladder, High impact, Varscan',
          'demo-bladder-high-muse': 'Bladder, High impact, Muse',
        },
      },
      filters: {
        'demo-bladder-high-mutect': {
          op: 'and',
          content: [
            {
              op: 'in',
              content: { field: 'cases.primary_site', value: ['Bladder'] },
            },
            {
              op: 'in',
              content: {
                field: 'ssms.consequence.transcript.annotation.impact',
                value: ['HIGH'],
              },
            },
            {
              op: 'in',
              content: {
                field:
                  'ssms.occurrence.case.observation.variant_calling.variant_caller',
                value: ['mutect'],
              },
            },
          ],
        },
        'demo-bladder-high-varscan': {
          op: 'and',
          content: [
            {
              op: 'in',
              content: { field: 'cases.primary_site', value: ['Bladder'] },
            },
            {
              op: 'in',
              content: {
                field: 'ssms.consequence.transcript.annotation.impact',
                value: ['HIGH'],
              },
            },
            {
              op: 'in',
              content: {
                field:
                  'ssms.occurrence.case.observation.variant_calling.variant_caller',
                value: ['varscan'],
              },
            },
          ],
        },
        'demo-bladder-high-muse': {
          op: 'and',
          content: [
            {
              op: 'in',
              content: { field: 'cases.primary_site', value: ['Bladder'] },
            },
            {
              op: 'in',
              content: {
                field: 'ssms.consequence.transcript.annotation.impact',
                value: ['HIGH'],
              },
            },
            {
              op: 'in',
              content: {
                field:
                  'ssms.occurrence.case.observation.variant_calling.variant_caller',
                value: ['muse'],
              },
            },
          ],
        },
      },
      type: 'set_operations',
    },
    DemoComponent: props => {
      const type = ['case', 'gene', 'ssm'].find(t => props.sets[t]);
      return (
        <Demo {...props}>
          <SetOperations type={type} sets={props.sets[type]} />;
        </Demo>
      );
    },
    setInstructions: 'Select 2 or 3 of the same set type',
    setDisabledMessage: ({ sets, type }) =>
      ['case', 'gene', 'ssm'].filter(t => t !== type).some(t => sets[t])
        ? 'Please choose only one type'
        : Object.keys(sets[type] || {}).length >= 3
          ? `Please select two or three ${type === 'ssm'
              ? 'mutation'
              : type} sets`
          : null,
    setTypes: ['case', 'gene', 'ssm'],
    validateSets: sets => {
      const entries = Object.entries(sets);
      return (
        entries.length === 1 && // can only have one type
        // must have 2 or 3 sets selected
        (Object.keys(entries[0][1]).length === 2 ||
          Object.keys(entries[0][1]).length === 3)
      );
    },
    ResultComponent: ({ sets }) => {
      const type = ['case', 'gene', 'ssm'].find(t => sets[t]);

      return <SetOperations type={type} sets={sets[type]} />;
    },
  },
  {
    type: 'comparison',
    label: 'Cohort Comparison',
    Icon: withTheme(({ theme }) => (
      <CCIcon
        width="80px"
        height="80px"
        color1="rgb(105, 16, 48)"
        color2={theme.primary}
      />
    )),
    description: `Display the survival analysis of your case sets and compare
    characteristics such as gender, vital status and age at diagnosis.`,
    demoData: {
      sets: {
        case: {
          'demo-kras': 'Pancreas - KRAS mutated',
          'demo-no-kras': 'Pancreas - KRAS not mutated',
        },
      },
      filters: {
        'demo-kras': {
          op: 'and',
          content: [
            {
              op: 'in',
              content: { field: 'genes.symbol', value: ['KRAS'] },
            },
          ],
        },
        'demo-no-kras': {
          op: 'and',
          content: [
            {
              op: 'excludeifany',
              content: { field: 'genes.symbol', value: 'KRAS' },
            },
          ],
        },
      },
      type: 'comparison',
    },
    DemoComponent: props => (
      <Demo {...props}>
        <CohortComparison
          facets={[
            'demographic.gender',
            'diagnoses.vital_status',
            'demographic.race',
          ]}
          sets={props.sets}
        />
      </Demo>
    ),
    setInstructions: 'Select 2 case sets',
    setDisabledMessage: ({ sets, type }) =>
      !['case'].includes(type)
        ? "This analysis can't be run with this type"
        : Object.keys(sets[type] || {}).length >= 2
          ? `You can only select two ${type === 'ssm' ? 'mutation' : type} set`
          : null,
    setTypes: ['case'],
    validateSets: sets =>
      ['case'].every((t: any) => Object.keys(sets[t] || {}).length === 2),
    ResultComponent: ({ sets }) => {
      return (
        <CohortComparison
          facets={[
            'demographic.gender',
            'diagnoses.vital_status',
            'demographic.race',
          ]}
          sets={sets}
        />
      );
    },
  },
];

export default availableAnalysis;