import { FAILURE, REQUEST, SUCCESS } from 'app/shared/reducers/action-type.util';
import {
  ABSENCE_VALIDATOR_TICKET,
  EXPENSE_VALIDATOR_TICKET,
  PROJECT_CONTRACTOR_TICKET,
  PROJECT_VALIDATOR_TICKET,
  RESOURCE_TICKET
} from 'app/application/common/reducers/ticket/ticket.actions';

export const ACTION_TYPES = {
  CHECK_ABSENCEVALIDATOR_TICKET: 'ticket/CHECK_ABSENCEVALIDATOR_TICKET',
  CHECK_PROJECTVALIDATOR_TICKET: 'ticket/CHECK_PROJECTVALIDATOR_TICKET',
  CHECK_RESOURCE_TICKET: 'ticket/CHECK_RESOURCE_TICKET',
  CHECK_EXPENSEVALIDATOR_TICKET: 'ticket/CHECK_EXPENSEVALIDATOR_TICKET',
  CHECK_PROJECTCONTRACTOR_TICKET: 'ticket/CHECK_PROJECTCONTRACTOR_TICKET',
  SET_CHECKING: 'ticket/SET_CHECKING',
  RESET_TICKET: 'ticket/RESET'
};

const initialState = {
  loading: false,
  errorMessage: null,
  valide: null,
  ticket: null,
  ticketType: null,
  checking: false
};

export type TicketReducer = Readonly<typeof initialState>;

// Reducer
export default (state: TicketReducer = initialState, action): TicketReducer => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.CHECK_ABSENCEVALIDATOR_TICKET):
    case REQUEST(ACTION_TYPES.CHECK_PROJECTVALIDATOR_TICKET):
    case REQUEST(ACTION_TYPES.CHECK_RESOURCE_TICKET):
    case REQUEST(ACTION_TYPES.CHECK_EXPENSEVALIDATOR_TICKET):
    case REQUEST(ACTION_TYPES.CHECK_PROJECTCONTRACTOR_TICKET):
      return {
        ...state,
        ticket: action.meta,
        errorMessage: null,
        loading: true
      };
    case FAILURE(ACTION_TYPES.CHECK_ABSENCEVALIDATOR_TICKET):
    case FAILURE(ACTION_TYPES.CHECK_PROJECTVALIDATOR_TICKET):
    case FAILURE(ACTION_TYPES.CHECK_RESOURCE_TICKET):
    case FAILURE(ACTION_TYPES.CHECK_EXPENSEVALIDATOR_TICKET):
    case FAILURE(ACTION_TYPES.CHECK_PROJECTCONTRACTOR_TICKET):
      return {
        ...state,
        loading: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.CHECK_ABSENCEVALIDATOR_TICKET):
      return {
        ...state,
        loading: false,
        valide: action.payload.data,
        ticketType: ABSENCE_VALIDATOR_TICKET
      };
    case SUCCESS(ACTION_TYPES.CHECK_PROJECTVALIDATOR_TICKET):
      return {
        ...state,
        loading: false,
        valide: action.payload.data,
        ticketType: PROJECT_VALIDATOR_TICKET
      };
    case SUCCESS(ACTION_TYPES.CHECK_RESOURCE_TICKET):
      return {
        ...state,
        loading: false,
        valide: action.payload.data,
        ticketType: RESOURCE_TICKET
      };
    case SUCCESS(ACTION_TYPES.CHECK_EXPENSEVALIDATOR_TICKET):
      return {
        ...state,
        loading: false,
        valide: action.payload.data,
        ticketType: EXPENSE_VALIDATOR_TICKET
      };
    case SUCCESS(ACTION_TYPES.CHECK_PROJECTCONTRACTOR_TICKET):
      return {
        ...state,
        loading: false,
        valide: action.payload.data,
        ticketType: PROJECT_CONTRACTOR_TICKET
      };

    case ACTION_TYPES.SET_CHECKING:
      return {
        ...state,
        checking: action.payload
      };
    case ACTION_TYPES.RESET_TICKET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
