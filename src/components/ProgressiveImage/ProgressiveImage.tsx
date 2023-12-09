import clsx from 'clsx';
import { useState } from 'react';

const loaded: any = {};

export type ProgressiveImageProps = {
  /**
   * The name and id to give to the figure
   */
  name: string
  /**
   * The aspect ratio, as a percentage, of the image to be loaded. Used to
   * produce the intrinsic placeholder in order to avoid reflow.
   */
  aspect: number
  /**
   * The source url of the thumbnail to display as a placeholder until the
   * large image is loaded.
   */
  smallSrc: string
  /**
   * The source of the final, large image to display.
   */
  largeSrc: string
  /**
   * Additional classnames to give to the figure.
   */
  className?: string
  /**
   * The caption to give to the figure.
   */
  caption?: any
  /**
   * The placeholder wrapper component
   */
  wrapper?: any
  /**
   * Additional wrapper props
   */
  wrapperProps?: any
}

export const ProgressiveImage = ({
  name,
  aspect,
  smallSrc,
  largeSrc,
  className,
  caption,
  wrapper: Wrapper = 'div',
  wrapperProps,
}: ProgressiveImageProps) => {
  const [small, setSmall] = useState<boolean>(false);
  const [large, setLarge] = useState<boolean>(false);

  return (
    <figure id={name} className={clsx('progressive-image', name, className)}>
      <Wrapper className="placeholder" data-large={largeSrc} {...wrapperProps}>
        <img src={smallSrc} onLoad={() => { setSmall(true); }} className={clsx('small', { visible: small && !large && !loaded[largeSrc] })} />
        <img src={largeSrc} onLoad={() => { setLarge(true); loaded[largeSrc] = true }} className={clsx({ visible: large || loaded[largeSrc] })} />
        <div style={{
          paddingBottom: `${aspect}%`
        }} />
      </Wrapper>
      {caption}
    </figure>
  );
}
