import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toast } = useApp();
  return (
    <div style={{
      position: 'absolute', bottom: 70, left: '50%',
      transform: `translateX(-50%) translateY(${toast ? 0 : 20}px)`,
      background: 'rgba(0,0,0,.75)', color: '#fff', fontSize: 12,
      padding: '7px 16px', borderRadius: 20,
      opacity: toast ? 1 : 0,
      transition: 'opacity .3s, transform .3s',
      pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 400,
    }}>
      {toast}
    </div>
  );
}
