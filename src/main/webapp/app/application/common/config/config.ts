import { setLocale } from 'yup';
import { Spin } from 'antd';
import { LoadingSvg } from './ui-constants';
/* tslint:disable */

export function setYupLocale() {
  const frYupLocale = {
    mixed: {
      default: 'Le champ "${path}" est invalide',
      required: 'Le champ "${path}" est obligatoire',
      oneOf: 'Le champ "${path}" doit être l"une des valeurs suivantes: ${values}',
      notOneOf: 'Le champ "${path}" ne doit pas être l"une des valeurs suivantes: ${values}'
    },
    string: {
      length: 'Le champ "${path}" doit être exactement ${length} caractères',
      min: 'Le champ "${path}" doit avoir au moins ${min} caractères',
      max: 'Le champ "${path}" doit contenir au plus ${max} caractères',
      matches: 'Le champ "${path}" doit correspondre à: ${regex}',
      email: 'Le champ "${path}" doit être un email valide',
      url: 'Le champ "${path}" doit être une URL valide',
      trim: 'Le champ "${path}" doit être une chaîne coupée',
      lowercase: 'Le champ "${path}" doit être une chaîne minuscule',
      uppercase: 'Le champ "${path}" doit être une chaîne en majuscule'
    },
    number: {
      min: 'Le champ "${path}" doit être supérieur ou égal à ${min}',
      max: 'Le champ "${path}" doit être inférieur ou égal à ${max}',
      lessThan: 'Le champ "${path}" doit être inférieur à ${less}',
      moreThan: 'Le champ "${path}" doit être supérieur à ${more}',
      notEqual: 'Le champ "${path}" ne doit pas être égal à ${notEqual}',
      positive: 'Le champ "${path}" doit être un nombre positif',
      negative: 'Le champ "${path}" doit être un nombre négatif',
      integer: 'Le champ "${path}" doit être un entier'
    },
    date: {
      min: 'Le champ "${path}" doit être postérieur à ${min}',
      max: 'Le champ "${path}" doit être antérieur à ${max}'
    },
    object: {
      noUnknown: 'Le champ "${path}" ne peut pas contenir de clés non spécifiées dans la forme de l"objet'
    },
    array: {
      min: 'Le champ "${path}" doit contenir au moins ${min} éléments',
      max: 'Le champ "${path}" doit avoir moins de ou égal à ${max} éléments'
    }
  };
  setLocale(frYupLocale);
}

export function defaultConfiguration() {
  setYupLocale();
  Spin.setDefaultIndicator(LoadingSvg);
}
