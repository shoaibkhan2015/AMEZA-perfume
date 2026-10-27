import { Fragment } from 'react';

// <br> between lines (Liquid's newline_to_br)
export const nl2br = text => String(text).split('\n').map((line, i) => <Fragment key={i}>{i > 0 && <br />}{line}</Fragment>);
