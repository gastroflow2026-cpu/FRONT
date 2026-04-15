import * as yup from 'yup';

export const reservationSchema = yup.object().shape({
  name: yup
    .string()
    .required('Ingresa tu nombre.')
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'El nombre no puede contener números ni símbolos.'),
  email: yup
    .string()
    .required('Ingresa tu email.')
    .email('Ingresa un email válido.'),
  phone: yup
    .string()
    .required('Ingresa tu teléfono.')
    .matches(/^\d{10}$/, 'El teléfono debe tener exactamente 10 números.'),
  date: yup
    .string()
    .required('Selecciona una fecha.')
    .test('is-today-or-future', 'No se puede reservar en fechas pasadas.', value => {
      if (!value) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(value + 'T00:00:00'); 
      return selectedDate >= today;
    }),
  time: yup
    .string()
    .required('Selecciona una hora.')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, 'El formato de la hora debe ser HH:mm (24hs).')
    .test('is-future-time', 'La hora seleccionada ya pasó.', function (value) {
      const { date } = this.parent;
      if (!date || !value) return true;

      const now = new Date();
      const selectedDate = new Date(date + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Si la fecha seleccionada es un día futuro, cualquier hora es válida
      if (selectedDate > today) return true;

      // Si la fecha es hoy, validamos que la hora no haya pasado
      const match = value.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
      if (!match) return false;

      const hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);

      const reservationTime = new Date();
      reservationTime.setHours(hours, minutes, 0, 0);

      // La reserva debe ser posterior al momento actual
      return reservationTime > now;
    }),
  guests: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .min(1, 'Debe haber al menos 1 comensal.')
    .required('Selecciona la cantidad de comensales.'),
});