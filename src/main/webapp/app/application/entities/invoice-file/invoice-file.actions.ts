import { ACTION_TYPES } from 'app/entities/invoice-file/invoice-file.reducer';
import { IInvoiceFile } from 'app/shared/model/invoice-file.model';
import axios from 'axios';

const apiUrl = 'api/invoice-files';

export const getByInvoiceId = (id: number) => dispatch =>
  dispatch({
    type: ACTION_TYPES.FETCH_INVOICEFILE,
    payload: axios.get<IInvoiceFile>(`${apiUrl}/${id}?override`)
  });
