import { useState, type RefObject } from 'react';
import type { Locale, SceneRuntime } from '../runtime/scene-contract';
import '../styles/exterior-controls.css';

/** A button alternative to dragging; ordinary page scroll remains available. */
export default function ExteriorControls({runtime,locale,enabled,onManualInput}: {
  runtime:RefObject<SceneRuntime|null>;locale:Locale;enabled:boolean;onManualInput?():void;
}) {
  const [open,setOpen]=useState(false);
  const [manual,setManual]=useState(false);
  const c=locale==='vi'?{
    title:'Điều chỉnh góc nhìn',rotate:'Xoay',look:'Góc nhìn',zoom:'Thu phóng',
    left:'Xoay trái',right:'Xoay phải',up:'Nhìn lên',down:'Nhìn xuống',
    closer:'Phóng to',farther:'Thu nhỏ',reset:'Đặt lại',manual:'Góc nhìn thủ công',
    help:'Điều chỉnh tòa nhà bằng các nút. Cuộn trang để khám phá các tầng.',
  }:{
    title:'Exterior controls',rotate:'Rotate',look:'Look',zoom:'Zoom',
    left:'Rotate left',right:'Rotate right',up:'Look up',down:'Look down',
    closer:'Zoom in',farther:'Zoom out',reset:'Reset view',manual:'Manual view',
    help:'Use the buttons to inspect the building. Scroll to explore its floors.',
  };
  function takeControl(){runtime.current?.stopAutomaticPresentation();setManual(true);onManualInput?.();}
  function adjust(change:{rotate?:number;look?:number;zoom?:number}){takeControl();runtime.current?.adjustExterior(change);}
  return <div className="exterior-controls" data-enabled={enabled}>
    <button type="button" className="exterior-controls-toggle" disabled={!enabled} aria-expanded={open} onClick={()=>{takeControl();setOpen(value=>!value);}}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 17h16M8 4v6m8 4v6"/></svg>
      {c.title}
    </button>
    {open&&<div className="exterior-controls-panel" role="group" aria-label={c.title}>
      <p className="exterior-controls-help">{c.help}</p>
      <div className="exterior-controls-row"><span>{c.rotate}</span><button type="button" disabled={!enabled} aria-label={c.left} onClick={()=>adjust({rotate:-.15})}>←</button><button type="button" disabled={!enabled} aria-label={c.right} onClick={()=>adjust({rotate:.15})}>→</button></div>
      <div className="exterior-controls-row"><span>{c.look}</span><button type="button" disabled={!enabled} aria-label={c.down} onClick={()=>adjust({look:-.07})}>↓</button><button type="button" disabled={!enabled} aria-label={c.up} onClick={()=>adjust({look:.07})}>↑</button></div>
      <div className="exterior-controls-row"><span>{c.zoom}</span><button type="button" disabled={!enabled} aria-label={c.farther} onClick={()=>adjust({zoom:.1})}>−</button><button type="button" disabled={!enabled} aria-label={c.closer} onClick={()=>adjust({zoom:-.1})}>+</button></div>
      <button type="button" className="exterior-controls-reset" disabled={!enabled} onClick={()=>{takeControl();runtime.current?.resetExterior();}}>{c.reset}</button>
      {manual&&<span className="exterior-controls-status" role="status">{c.manual}</span>}
    </div>}
  </div>;
}
