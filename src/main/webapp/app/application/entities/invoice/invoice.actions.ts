import axios from 'axios';
import { cleanEntity } from 'app/shared/util/entity-utils';
import { ACTION_TYPES } from 'app/entities/invoice/invoice.reducer';
import { ACTION_TYPES as ACTION_TYPES_EXT } from './invoice.reducer';
import { ACTION_TYPES as ACTION_TYPES_LIST } from './invoice-list.reducer';
import { IInvoice, InvoiceStatus } from 'app/shared/model/invoice.model';
import { getInvoiceName } from 'app/application/common/utils/invoice-utils';
import { IRootState } from 'app/shared/reducers';
import * as InvoiceItem from 'app/application/entities/invoice-item/invoice-item.actions';
import * as ProjectResource from 'app/entities/project-resource/project-resource.reducer';
import * as ProjectResourceInfo from 'app/application/entities/project-resource-info/project-resource-info.actions';
import * as Client from 'app/entities/client/client.reducer';
import * as Client_ext from 'app/application/entities/client/client.actions';
import * as Project from 'app/entities/project/project.reducer';
import * as ActivityReport from 'app/entities/activity-report/activity-report.reducer';
import * as ResourceExt from 'app/application/entities/resource/resource.actions';
import { IClient } from 'app/shared/model/client.model';
import { IInvoiceItem } from 'app/shared/model/invoice-item.model';

const apiUrl = 'api/invoices';

// Actions
export const getInvoices = (page, size, sort) => async (dispatch, getState) => {
  const state: IRootState = getState();
  const companyId = state.application.company.current.id;
  const requestUrl = `${apiUrl}?override&companyId=${companyId}${sort ? `&page=${page}&size=${size}&sort=${sort}` : ''}`;
  await dispatch({
    type: ACTION_TYPES.FETCH_INVOICE_LIST,
    payload: axios.get<IInvoice>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  });
};

export const getPerCurrentCompany = (page, size, sort) => async (dispatch, getState) => {
  dispatch({ type: ACTION_TYPES_LIST.SET_LOADING, payload: true });
  let state: IRootState = getState();
  const companyId = state.application.company.current.id;
  const cacheBuster = `&cacheBuster=${new Date().getTime()}`;
  const requestUrl = `${apiUrl}?override&companyId=${companyId}${sort ? `&page=${page}&size=${size}&sort=${sort}` : ''}`;
  await dispatch({
    type: ACTION_TYPES_LIST.FETCH_INVOICE_LIST,
    payload: axios.get<IInvoice>(`${requestUrl}${cacheBuster}`)
  });
  state = getState();
  const invoices = state.application.invoiceList.invoices;
  if (invoices.length > 0) {
    dispatch({
      type: ACTION_TYPES_LIST.FETCH_CLIENT_LIST,
      payload: axios.get<IClient>(`api/clients?override&companyId=${companyId}&page=0&size=999${cacheBuster}`)
    });
    const projectids = invoices.map(inv => inv.projectId).filter((id, index, self) => !!id && self.indexOf(id) === index);
    if (projectids.length > 0) {
      dispatch({
        type: ACTION_TYPES_LIST.FETCH_PROJECT_LIST,
        payload: axios.get<IClient>(`api/projects?override&idIn=${projectids.join(',')}&page=0&size=999${cacheBuster}`)
      });
    }
    const invoiceIds = invoices.map(inv => inv.id).filter((id, index, self) => !!id && self.indexOf(id) === index);
    return dispatch({
      type: ACTION_TYPES_LIST.FETCH_INVOICEITEM_LIST,
      payload: axios.get<IInvoiceItem>(`api/invoice-items?override&invoiceIdIn=${invoiceIds.join(',')}&page=0&size=999${cacheBuster}`)
    });
  }
  dispatch({ type: ACTION_TYPES_LIST.SET_LOADING, payload: false });
};

export const getByProject = (projectId, page, size, sort) => async (dispatch, getState) => {
  const requestUrl = `${apiUrl}?override&projectId=${projectId}${sort ? `&page=${page}&size=${size}&sort=${sort}` : ''}`;
  await dispatch({
    type: ACTION_TYPES.FETCH_INVOICE_LIST,
    payload: axios.get<IInvoice>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  });
  const state: IRootState = getState();
  const invoices = state.invoice.entities;
  if (invoices.length > 0) {
    const invoicesIds = invoices.map(invoice => invoice.id);
    dispatch(InvoiceItem.getByInvoicesIn(invoicesIds));
    dispatch(Client_ext.getClients(0, 999, 'id,desc'));
  }
};

export const getByClient = (clientId, page, size, sort) => async (dispatch, getState) => {
  const requestUrl = `${apiUrl}?override&clientId=${clientId}${sort ? `&page=${page}&size=${size}&sort=${sort}` : ''}`;
  await dispatch({
    type: ACTION_TYPES.FETCH_INVOICE_LIST,
    payload: axios.get<IInvoice>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  });
  const state: IRootState = getState();
  const invoices = state.invoice.entities;
  if (invoices.length > 0) {
    const invoicesIds = invoices.map(invoice => invoice.id);
    dispatch(InvoiceItem.getByInvoicesIn(invoicesIds));
  }
};

export const getByActivityReportsIn = (activityReportsIds: number[]) => async (dispatch, getState) => {
  const requestUrl = `${apiUrl}?override&activityReportIdIn=${activityReportsIds.join(',')}&page=0&size=999`;
  await dispatch({
    type: ACTION_TYPES.FETCH_INVOICE_LIST,
    payload: axios.get<IInvoice>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  });
  const state: IRootState = getState();
  const invoices = state.invoice.entities;
  if (invoices.length > 0) {
    const invoicesIds = invoices.map(invoice => invoice.id);
    dispatch(InvoiceItem.getByInvoicesIn(invoicesIds));
  }
};

export const getInvoice = id => async (dispatch, getState) => {
  const requestUrl = `${apiUrl}/${id}`;
  await dispatch({
    type: ACTION_TYPES.FETCH_INVOICE,
    payload: axios.get<IInvoice>(requestUrl)
  });
  let state: IRootState = getState();
  const invoice = state.invoice.entity;
  if (invoice) {
    if (!!invoice.nettingId) {
      dispatch({
        type: ACTION_TYPES_EXT.FETCH_NETTING_INVOICE,
        payload: axios.get<IInvoice>(`${apiUrl}/${invoice.nettingId}`)
      });
    }
    dispatch(InvoiceItem.getByInvoice(invoice.id));
    if (!state.client.entity.id || state.client.entity.id !== invoice.clientId) {
      dispatch(Client.getEntity(invoice.clientId));
    }
    dispatch(ResourceExt.reset());
    if (invoice.activityReportId) {
      await dispatch(ActivityReport.getEntity(invoice.activityReportId));
      state = getState();
      const report = state.activityReport.entity;
      if (report.projectResourceId) {
        dispatch(ProjectResourceInfo.getByProjectResource(report.projectResourceId));
        await dispatch(ProjectResource.getEntity(report.projectResourceId));
        state = getState();
        const projectResource = state.projectResource.entity;
        dispatch(ResourceExt.getById(projectResource.resourceId));
      }
    }
    if (invoice.projectId) {
      state = getState();
      if (!state.project.entity.id || state.project.entity.id !== invoice.projectId) {
        dispatch(Project.getEntity(invoice.projectId));
      }
    }
  }
};

export const create = ({ items, ...entity }: IInvoice) => async (dispatch, getState) => {
  await dispatch({
    type: ACTION_TYPES.CREATE_INVOICE,
    payload: axios.post(`${apiUrl}?override`, cleanEntity(entity))
  });
  const state: IRootState = getState();
  const invoice = state.invoice.entity;
  items.map(item => (item.invoiceId = invoice.id));
  return dispatch(InvoiceItem.createBulk(items));
};

export const update = ({ items, ...entity }: IInvoice, deletedItemIds: any[] = []) => async (dispatch, getState) => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_INVOICE,
    payload: axios.put(`${apiUrl}?override`, cleanEntity(entity))
  });
  const state: IRootState = getState();
  const invoice = state.invoice.entity;
  if (deletedItemIds.length > 0) {
    await dispatch(InvoiceItem.deleteBulk(deletedItemIds));
  }
  items.map(item => {
    delete item.id;
    item.invoiceId = invoice.id;
    return item;
  });
  await dispatch(InvoiceItem.createBulk(items));
  return result;
};

export const sendEmail = entity => ({
  type: ACTION_TYPES.UPDATE_INVOICE,
  payload: axios.put(`${apiUrl}?override&email=true`, cleanEntity({ ...entity, status: InvoiceStatus.SENT }))
});

export const markAsSent = entity => ({
  type: ACTION_TYPES.UPDATE_INVOICE,
  payload: axios.put(`${apiUrl}?override&email=false`, cleanEntity({ ...entity, status: InvoiceStatus.SENT }))
});

export const sendEmailBulk = (invoices: IInvoice[]) => ({
  type: ACTION_TYPES.UPDATE_INVOICE,
  payload: axios.put(`${apiUrl}?bulk`, invoices.map(invoice => ({ ...invoice, status: InvoiceStatus.SENT })))
});

export const markAsPaid = entity => ({
  type: ACTION_TYPES.UPDATE_INVOICE,
  payload: axios.put(`${apiUrl}?override`, cleanEntity({ ...entity, status: InvoiceStatus.PAID }))
});

export const sendReminderEmail = invoiceId => ({
  type: ACTION_TYPES_EXT.SEND_INVOICE_REMINDER,
  payload: axios.get(`${apiUrl}/send-reminder/${invoiceId}`)
});

export const download = invoice => async (dispatch, getState) => {
  await dispatch({
    type: ACTION_TYPES_EXT.DOWNLOAD_INVOICE,
    payload: axios.get(`${apiUrl}/${invoice.id}/download`)
  });
  const state: IRootState = getState();
  const link = document.createElement('a');
  link.download = getInvoiceName(invoice) + '.pdf';
  link.href = 'data:application/pdf;charset=utf-8;base64,' + state.application.invoice.pdf;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const deleteInvoice = (id: number) => async dispatch =>
  dispatch({
    type: ACTION_TYPES.DELETE_INVOICE,
    payload: axios.delete(`${apiUrl}/${id}?override`)
  });

export const generate = (activityReportIds: number[]) => async dispatch => {
  dispatch({ type: ACTION_TYPES_EXT.SET_GENERATING, payload: true });
  for (const activityReportId of activityReportIds) {
    await dispatch({
      type: ACTION_TYPES_EXT.GENERATE_INVOICES,
      payload: axios.post(`${apiUrl}/generate/${activityReportId}`)
    });
  }
  dispatch({ type: ACTION_TYPES_EXT.SET_GENERATING, payload: false });
};

export const reset = () => dispatch => dispatch({ type: ACTION_TYPES_EXT.RESET });
