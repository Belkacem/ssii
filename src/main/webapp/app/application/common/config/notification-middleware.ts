import { message as Message } from 'antd';

// noinspection JSUnusedLocalSymbols
const showError = (message, key?, data?) => {
  Message.error(message);
};

export default () => next => action => {
  const isPromise = action.payload instanceof Promise;
  if (!isPromise) {
    return next(action);
  }
  return next(action)
    .then(response => {
      return Promise.resolve(response);
    })
    .catch(error => {
      if (action.meta && action.meta.errorMessage) {
        // showError(action.meta.errorMessage);
      } else if (error && error.response) {
        const response = error.response;
        const data = response.data;
        if (response.status !== 401) {
          if (
            !(
              error.message === '' ||
              (data && data.path && data.path.includes('/api/account')) ||
              (response.config && response.config.url && response.config.url.includes('api/companies'))
            )
          ) {
            let i;
            switch (response.status) {
              // connection refused, server not reachable
              case 0:
                showError('Serveur non accessible !', 'error.server.not.reachable');
                break;

              case 400:
                const headers = Object.entries(response.headers);
                let errorHeader = null;
                let entityKey = null;
                headers.forEach(([k, v]: [string, string]) => {
                  if (k.toLowerCase().endsWith('app-error')) {
                    errorHeader = v;
                  } else if (k.toLowerCase().endsWith('app-params')) {
                    entityKey = v;
                  }
                });
                if (errorHeader) {
                  showError(errorHeader, errorHeader, { entityName: entityKey });
                } else if (data !== '' && data.fieldErrors) {
                  const fieldErrors = data.fieldErrors;
                  for (i = 0; i < fieldErrors.length; i++) {
                    const fieldError = fieldErrors[i];
                    if (['Min', 'Max', 'DecimalMin', 'DecimalMax'].includes(fieldError.message)) {
                      fieldError.message = 'Size';
                    }
                    // convert 'something[14].other[4].id' to 'something[].other[].id' so translations can be written to it
                    const convertedField = fieldError.field.replace(/\[\d*]/g, '[]');
                    const fieldName = convertedField.charAt(0).toUpperCase() + convertedField.slice(1);
                    showError(`Erreur sur le champ "${fieldName}"`, `error.${fieldError.message}`, { fieldName });
                  }
                } else if (data !== '' && data.message) {
                  showError(data.message, data.message, data.params);
                } else {
                  showError(data);
                }
                break;

              case 404:
                showError('Non trouvé !', 'error.url.not.found');
                break;

              default:
                if (data !== '' && data.message) {
                  showError(data.message);
                } else {
                  showError(data);
                }
            }
          }
        }
      } else if (error && error.message) {
        showError(error.message);
      } else {
        showError('Erreur inconnue !');
      }
      return Promise.reject(error);
    });
};
