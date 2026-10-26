export interface Props {
  text?: string
  as?: keyof HTMLElementTagNameMap
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  color?: string
}
