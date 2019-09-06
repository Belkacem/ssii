import React, { FunctionComponent, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { DatePicker, Pagination, Icon } from 'antd';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import { IRootState } from 'app/shared/reducers';
import { getAudits } from 'app/modules/administration/administration.reducer';
import { FORMAT_DATE_PICKER, FORMAT_DATE_SERVER, FORMAT_DATETIME } from 'app/application/common/config/constants';
import moment, { Moment } from 'moment';
import { getUrlParameter } from 'app/application/common/utils/url-utils';
import { DateFormat } from 'app/application/components/date.format.component';

interface IAuditsPageProps extends StateProps, DispatchProps, RouteComponentProps<{}> {}

const lastMonth: [Moment, Moment] = [moment().add(-1, 'month'), moment()];

const dateRanges: { [range: string]: [Moment, Moment] } = {
  "Aujourd'hui": [moment(), moment()],
  'Cette semaine': [moment().startOf('week'), moment().endOf('week')],
  'La semaine derniere': [moment().add(-1, 'week'), moment()],
  'Ce mois-ci': [moment().startOf('month'), moment().endOf('month')],
  'Le mois dernier': [moment().add(-1, 'month'), moment()],
  'Cette annee': [moment().startOf('year'), moment().endOf('year')]
};

export const AuditsPage: FunctionComponent<IAuditsPageProps> = props => {
  const [dates, setDates] = useState<[Moment, Moment]>(lastMonth);
  const [activePage, setActivePage] = useState(1);

  useEffect(
    () => {
      const fromDate = dates[0].format(FORMAT_DATE_SERVER);
      const toDate = dates[1].format(FORMAT_DATE_SERVER);
      props.getAudits(activePage - 1, 10, `id,asc`, fromDate, toDate);
    },
    [dates, activePage]
  );

  useEffect(
    () => {
      const page = getUrlParameter('page', props.location.search);
      setActivePage(parseInt(page, 10) || 1);
    },
    [props.location.search]
  );

  const handlePagination = page => {
    props.history.push(`${props.location.pathname}?page=${page}&sort=id,asc`);
  };

  const handleChangeDateRange = (values: [Moment, Moment]) => {
    setDates(values);
    if (activePage !== 1) {
      handlePagination(1);
    }
  };

  const { audits, totalItems } = props;
  return (
    <div className="table-layout-page">
      <div className="table-layout-head">
        <PageHead
          title={
            <>
              <Icon type="bell" /> Vérification (Audits)
            </>
          }
          margin={false}
          actions={
            <DatePicker.RangePicker value={dates} format={FORMAT_DATE_PICKER} onChange={handleChangeDateRange} ranges={dateRanges} />
          }
        />
      </div>
      <div className="table-layout-body">
        <div className="ant-table-wrapper">
          <div className="ant-table ant-table-medium">
            <div className="ant-table-content">
              <div className="ant-table-body">
                <table>
                  <thead className="ant-table-thead">
                    <tr>
                      <th>
                        <small>Date</small>
                      </th>
                      <th>
                        <small>User</small>
                      </th>
                      <th>
                        <small>State</small>
                      </th>
                      <th>
                        <small>Extra data</small>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="ant-table-tbody">
                    {audits.map((audit, i) => (
                      <tr key={`audit-${i}`}>
                        <td>{<DateFormat value={audit.timestamp} format={FORMAT_DATETIME} />}</td>
                        <td>{audit.principal}</td>
                        <td>{audit.type}</td>
                        <td>
                          {audit.data ? audit.data.message : null}
                          {audit.data ? audit.data.remoteAddress : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="table-layout-footer">
        <Pagination
          total={parseInt(`${totalItems}`, 10)}
          defaultCurrent={activePage}
          defaultPageSize={10}
          onChange={handlePagination}
          size="small"
        />
      </div>
    </div>
  );
};

const mapStateToProps = (storeState: IRootState) => ({
  audits: storeState.administration.audits,
  totalItems: storeState.administration.totalItems
});

const mapDispatchToProps = { getAudits };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AuditsPage);
