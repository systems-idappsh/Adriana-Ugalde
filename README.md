# Formulario clientes v3

Formulario HTML/CSS/JS inspirado en la estructura visual del ZIP de referencia.

## Archivos
- `index.html`
- `styles.css`
- `app.js`

No usa Python.

## Flujo
1. Correo + password.
2. MIN DATE + MAX DATE.
3. Pregunta Consular + CAS.
4. FACILITY_ID.
5. ASC_FACILITY_ID sólo cuando corresponde.
6. Referencia / ID / nombre.
7. Notas.
8. Agregar más o guardar y enviar.

## Comportamiento importante
El formulario no cambia de campo mientras se escribe. El siguiente bloque aparece al terminar el campo actual (`blur`) o seleccionar una opción (`change`).

## Telegram
El JavaScript envía mediante la API de Telegram y sólo informa éxito cuando Telegram devuelve `ok: true`.

Nota de seguridad: colocar un bot token en JavaScript de cliente lo deja visible a cualquier visitante. Para un sitio público conviene mover el token a un Worker/Function/backend.
