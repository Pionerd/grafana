import React, { PureComponent } from 'react';
import { Select, Switch, Icon, Field, FieldSet } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';
import { DashboardModel, PanelModel } from 'app/features/dashboard/state';
import { buildIframeHtml } from './utils';

const themeOptions: Array<SelectableValue<string>> = [
  { label: 'current', value: 'current' },
  { label: 'dark', value: 'dark' },
  { label: 'light', value: 'light' },
];

interface Props {
  dashboard: DashboardModel;
  panel?: PanelModel;
}

interface State {
  useCurrentTimeRange: boolean;
  selectedTheme: SelectableValue<string>;
  iframeHtml: string;
}

export class ShareEmbed extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      useCurrentTimeRange: true,
      selectedTheme: themeOptions[0],
      iframeHtml: '',
    };
  }

  componentDidMount() {
    this.buildIframeHtml();
  }

  buildIframeHtml = () => {
    const { panel } = this.props;
    const { useCurrentTimeRange, selectedTheme } = this.state;

    const iframeHtml = buildIframeHtml(useCurrentTimeRange, selectedTheme.value, panel);
    this.setState({ iframeHtml });
  };

  onUseCurrentTimeRangeChange = () => {
    this.setState(
      {
        useCurrentTimeRange: !this.state.useCurrentTimeRange,
      },
      this.buildIframeHtml
    );
  };

  onThemeChange = (value: SelectableValue<string>) => {
    this.setState(
      {
        selectedTheme: value,
      },
      this.buildIframeHtml
    );
  };

  render() {
    const { useCurrentTimeRange, selectedTheme, iframeHtml } = this.state;
    const isRelativeTime = this.props.dashboard ? this.props.dashboard.time.to === 'now' : false;

    return (
      <div className="share-modal-body">
        <div className="share-modal-header">
          <Icon name="link" className="share-modal-big-icon" size="xxl" />
          <div className="share-modal-content">
            <FieldSet>
              <Field
                label="Current time range"
                description={
                  isRelativeTime ? 'Transforms the current relative time range to an absolute time range' : ''
                }
              >
                <Switch
                  id="share-current-time-range"
                  value={useCurrentTimeRange}
                  onChange={this.onUseCurrentTimeRangeChange}
                />
              </Field>
              <Field label="Theme">
                <Select width={20} options={themeOptions} value={selectedTheme} onChange={this.onThemeChange} />
              </Field>
            </FieldSet>
            <p className="share-modal-info-text">
              The html code below can be pasted and included in another web page. Unless anonymous access is enabled,
              the user viewing that page need to be signed into grafana for the graph to load.
            </p>

            <div className="gf-form-group gf-form--grow">
              <div className="gf-form">
                <textarea rows={5} data-share-panel-url className="gf-form-input" defaultValue={iframeHtml}></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
