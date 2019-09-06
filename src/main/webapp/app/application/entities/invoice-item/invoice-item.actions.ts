import axios from 'axios';
import { ACTION_TYPES } from 'app/entities/invoice-item/invoice-item.reducer';
import { IInvoiceItem } from 'app/shared/model/invoice-item.model';

const apiUrl = 'api/invoice-items';

// Actions
export const getByInvoice = invoiceId => {
  const requestUrl = `${apiUrl}?override&invoiceIdIn=${invoiceId}&page=0&size=999`;
  return {
    type: ACTION_TYPES.FETCH_INVOICEITEM_LIST,
    payload: axios.get<IInvoiceItem>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  };
};

export const getByInvoicesIn = (invoiceIds: number[]) => {
  const requestUrl = `${apiUrl}?override&invoiceIdIn=${invoiceIds.join(',')}&page=0&size=999`;
  return {
    type: ACTION_TYPES.FETCH_INVOICEITEM_LIST,
    payload: axios.get<IInvoiceItem>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  };
};

export const createBulk = (items: IInvoiceItem[]) => async dispatch =>
  dispatch({
    type: ACTION_TYPES.CREATE_INVOICEITEM,
    payload: axios.post(`${apiUrl}/bulk`, items)
  });

export const deleteBulk = (ids: any[]) => async dispatch =>
  dispatch({
    type: ACTION_TYPES.DELETE_INVOICEITEM,
    payload: axios.delete(`${apiUrl}/bulk?ids=${ids.length > 1 ? ids.join(',') : ids}`)
  });
