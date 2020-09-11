import { style } from 'typestyle';

export const setupClass = style({
  width: '100%',
  height: '20%',
  borderBottom: 'var(--jp-border-width) solid var(--jp-toolbar-border-color)',
});

export const setupItemClass = style({
  display: 'block !important',
  padding: '10px !important',
});

export const setupItemInnerClass = style({
  width: '100%'
});

export const fileBrowserValue = style({
  display: 'none !important',
});