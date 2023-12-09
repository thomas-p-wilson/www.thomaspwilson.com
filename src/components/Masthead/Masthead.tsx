import clsx from 'clsx';
import { useCallback, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Masthead.scss';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

export const Masthead = () => {
  const [open, setOpen] = useState(false);
  const onClose = useCallback(() => {
    setOpen(false);
  }, []);
  const { ref } = useOnClickOutside(onClose);

  return (
    <header className="primary-header navbar-fixed" ref={ref}>
      <div className="main-menu">
        <nav className="navbar navbar-expand-lg">
          <div className="container wide">
            <Link to="/" className="navbar-brand">TW</Link>
            <button
                type="button"
                data-toggle="collapse"
                aria-controls="main-nav"
                aria-expanded={open}
                aria-label="Toggle navigation"
                className="navbar-toggler"
                onClick={() => { setOpen((open) => (!open)) }}
              >
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
            <div id="main-nav"
              className={clsx('collapse navbar-collapse offset', { show: open })}>
              <ul className="nav navbar-nav ml-auto">
                <li className="nav-item"><NavLink to="/" className="nav-link">Home</NavLink></li>
                <li className="nav-item"><NavLink to="/resume" className="nav-link">Résumé</NavLink></li>
                <li className="nav-item"><NavLink to="/calculators" className="nav-link">Calculators</NavLink></li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
