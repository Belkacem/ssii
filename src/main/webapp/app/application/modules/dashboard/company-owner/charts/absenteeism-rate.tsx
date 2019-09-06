import React, { FunctionComponent, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { getAbsences } from 'app/application/entities/absence/absence.actions';
import { getHolidaysByDate } from 'app/application/entities/holiday/holiday.actions';
import { Spin } from 'antd';
import moment, { Moment } from 'moment';
import { UnitsType } from 'app/application/common/utils/charts-utils';
import { Axis, Chart, Coord, Geom, Label, Legend, Tooltip, Guide } from 'bizcharts';
import DataSet from '@antv/data-set';
import { ValidationStatus } from 'app/shared/model/absence.model';

const TODAY = moment();
const dataView = new DataSet.DataView();
dataView.source([]).transform({
  type: 'percent',
  field: 'count',
  dimension: 'item',
  as: 'percent'
});

interface IAbsenteeismRateProps extends StateProps, DispatchProps {
  date?: Moment;
  unit?: UnitsType;
}

const getWorkDays = (startDate: Moment, endDate: Moment): number => {
  const lastDay = moment(endDate);
  const firstDay = moment(startDate);
  let calcBusinessDays = 1 + (lastDay.diff(firstDay, 'days') * 5 - (firstDay.day() - lastDay.day()) * 2) / 7;
  if (lastDay.day() === 6) calcBusinessDays--;
  if (firstDay.day() === 0) calcBusinessDays--;
  return calcBusinessDays;
};

const cols = {
  percent: {
    formatter: val => (val * 100).toFixed(2) + '%'
  }
};
const formatPoint = (val, item) => item.point.item + ': ' + val;

const AbsenteeismRate: FunctionComponent<IAbsenteeismRateProps> = props => {
  const { absences, loading, holidays, date = TODAY, unit = 'months' } = props;
  const filteredAbsences = absences
    .filter(ab => ab.validationStatus === ValidationStatus.APPROVED)
    .filter(ab => date.isSame(ab.start, unit));
  const countAbsenceResource = filteredAbsences
    .map(ab => ab.resourceId)
    .filter((id, index, self) => self.indexOf(id) === index)
    .reduce(total => total + 1, 0);
  useEffect(
    () => {
      const startDate = date
        .clone()
        .startOf(unit)
        .format('YYYY-MM-DD');
      const endDate = date
        .clone()
        .endOf(unit)
        .format('YYYY-MM-DD');
      props.getAbsences(0, 999, `start,asc`);
      props.getHolidaysByDate(startDate, endDate);
    },
    [unit, date]
  );

  useEffect(
    () => {
      if (absences.length > 0) {
        const countAbsences = filteredAbsences.reduce((total, ab) => total + ab.numberDays, 0);
        const countHolidays = holidays
          .filter(holiday => date.isSame(holiday.date, unit))
          .filter(holiday => {
            const day = moment(holiday.date).day();
            return day !== 0 && day !== 6;
          })
          .reduce(total => total + 1, 0);
        const startDate = date.clone().startOf(unit);
        const endDate = date.clone().endOf(unit);
        const countWorkDays = getWorkDays(startDate, endDate) - countHolidays;
        const data = [
          { item: "Jours d'absentéisme", count: countAbsences },
          { item: 'Jours travaillés', count: countWorkDays * (countAbsenceResource | 1) }
        ];
        dataView.source(data);
      }
    },
    [absences, holidays]
  );

  return (
    <Spin spinning={loading}>
      <Chart height={258} data={dataView} scale={cols} forceFit>
        <Coord type="theta" radius={1} innerRadius={0.75} />
        <Axis name="percent" />
        <Legend />
        <Tooltip
          showTitle={false}
          itemTpl="<li><span style='background-color:{color};' class='g2-tooltip-marker'></span>{name}: <b>{value}</b> jours</li>"
        />
        <Guide>
          <Guide.Html
            position={['50%', '50%']}
            html={`<div style="color:#8c8c8c;font-size:14px;line-height:20px;text-align: center;">
                            <div style="color:#262626;font-size:28px">${countAbsenceResource}</div>
                            <small>ressources</small>
                        </div>`}
            alignX="middle"
            alignY="middle"
          />
        </Guide>
        <Geom
          type="intervalStack"
          position="percent"
          color="item"
          tooltip={['item*count', (item, count) => ({ name: item, value: count })]}
          style={{ lineWidth: 1, stroke: '#fff' }}
        >
          <Label content="percent" formatter={formatPoint} />
        </Geom>
      </Chart>
    </Spin>
  );
};

const mapStateToProps = ({ application, holiday }: IRootState) => ({
  absences: application.absence.list.entities,
  loading: application.absence.list.loading,
  holidays: holiday.entities
});

const mapDispatchToProps = {
  getAbsences,
  getHolidaysByDate
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(AbsenteeismRate);
