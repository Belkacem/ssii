import axios from 'axios';
import { ACTION_TYPES } from 'app/modules/account/register/register.reducer';

// Actions
export const handleSignup = (email, firstName, lastName, password, ticket, ticketType) => ({
  type: ACTION_TYPES.CREATE_ACCOUNT,
  payload: axios.post(`api/register${ticket ? `?ticket=${ticket}&ticket-type=${ticketType}` : ''}`, {
    login: email,
    email,
    firstName,
    lastName,
    password,
    langKey: 'fr'
  }),
  meta: {
    successMessage: '<strong>Registration saved!</strong> Please check your email for confirmation.'
  }
});
