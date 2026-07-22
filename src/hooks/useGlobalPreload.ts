import { useState, useEffect } from 'react';


const ALL_IMAGES: string[] = [
  '/jogjaBG.png',
  '/baliBG.png',
  '/acehBG.png',
  '/malukuBG.png',

  '/map-islands/jogja.png',
  '/map-islands/bali.png',
  '/map-islands/aceh.png',
  '/map-islands/maluku.png',

  '/assets/bg_setting_mainmenu.png',

  '/assets/NPC/npc_jogja.png',
  '/assets/NPC/npc_bali.png',
  '/assets/NPC/npc_aceh.png',
  '/assets/NPC/npc_maluku.png',

  '/assets/result_mascots/jadahtempe_jempol.png',
  '/assets/result_mascots/pisangrai_jempol.png',
  '/assets/result_mascots/kue adee_jempol.png',
  '/assets/result_mascots/pisang asar_jempol.png',

  '/assets/universal/rotation_arrow.png',

  '/assets/foods_jogja/00_Klepon.png',
  '/assets/foods_jogja/01_Cenil.png',
  '/assets/foods_jogja/02_Yangko.png',
  '/assets/foods_jogja/03_Geplak.png',
  '/assets/foods_jogja/04_Bakpia.png',
  '/assets/foods_jogja/05_Lemper.png',
  '/assets/foods_jogja/06_TiwulAyu.png',
  '/assets/foods_jogja/07_JadahTempe.png',

  '/assets/foods_bali/00_laklak.png',
  '/assets/foods_bali/01_kaliadrem.png',
  '/assets/foods_bali/02_pie susu.png',
  '/assets/foods_bali/03_jaje walik.png',
  '/assets/foods_bali/04_bendu.png',
  '/assets/foods_bali/05_jaje uli.png',
  '/assets/foods_bali/06_pisang rai.png',

  '/assets/foods_aceh/00_samaloyang.png',
  '/assets/foods_aceh/01_timphan.png',
  '/assets/foods_aceh/02_pulot ijo.png',
  '/assets/foods_aceh/03_keukarah.png',
  '/assets/foods_aceh/04_bungong kayee.png',
  '/assets/foods_aceh/05_meuseukat.png',
  '/assets/foods_aceh/06_kue adee.png',

  '/assets/foods_maluku/00_koyabu.png',
  '/assets/foods_maluku/01_sagu lempeng.png',
  '/assets/foods_maluku/02_sagu gula.png',
  '/assets/foods_maluku/03_talam sagu bakar.png',
  '/assets/foods_maluku/04_asida.png',
  '/assets/foods_maluku/05_kue bagea.png',
  '/assets/foods_maluku/06_pisang asar.png',

  '/assets/klepon/bg_kitchen.png',
  '/assets/klepon/adonan_bolong.png',
  '/assets/klepon/adonan_isi.png',
  '/assets/klepon/adonan_bundar.png',
  '/assets/klepon/adonan_kelapa.png',
  '/assets/klepon/adonan_putar.png',
  '/assets/klepon/klepon_jadi.png',
  '/assets/klepon/mangkok.png',
  '/assets/klepon/mangkok_aduk.png',
  '/assets/klepon/kelapa_parut.png',
  '/assets/klepon/adonan 1.png',
  '/assets/klepon/adonan 2.png',
  '/assets/klepon/ing_gula.png',
  '/assets/klepon/ing_pandan.png',
  '/assets/klepon/ing_tepung.png',
  '/assets/klepon/ing_bawang.png',
  '/assets/klepon/ing_cabai.png',
  '/assets/klepon/ing_tomat.png',

  '/assets/pie_susu/ing_adonan 1.png',
  '/assets/pie_susu/ing_adonan 2.png',
  '/assets/pie_susu/ing_adonan jadi.png',
  '/assets/pie_susu/ing_adonan susu.png',
  '/assets/pie_susu/pie susu_jadi.png',
  '/assets/pie_susu/adonan_putar.png',
  '/assets/pie_susu/mangkok_aduk.png',
  '/assets/pie_susu/ing_tepung.png',
  '/assets/pie_susu/ing_mentega.png',
  '/assets/pie_susu/ing_telur.png',
  '/assets/pie_susu/ing_susu.png',
  '/assets/pie_susu/ing_cokelat.png',
  '/assets/pie_susu/ing_jeruk.png',
  '/assets/pie_susu/ing_tomat.png',

  '/assets/samaloyang/cetakan_berisi.png',
  '/assets/samaloyang/samaloyang_mold.png',
  '/assets/samaloyang/samaloyang_jadi.png',
  '/assets/samaloyang/adonan_putar.png',
  '/assets/samaloyang/mangkok_aduk.png',
  '/assets/samaloyang/ing_tepung.png',
  '/assets/samaloyang/ing_telur.png',
  '/assets/samaloyang/ing_santan.png',
  '/assets/samaloyang/ing_vanilla.png',

  '/assets/pisang_asar/pisang_terpotong.png',
  '/assets/pisang_asar/pisang_utuh.png',
  '/assets/pisang_asar/pisang_tray.png',
  '/assets/pisang_asar/pisang_topping.png',
  '/assets/pisang_asar/pisang_siap.png',
  '/assets/pisang_asar/pisang_asar.png',
  '/assets/pisang_asar/pisang_mantap.png',
  '/assets/pisang_asar/pisang.png',
  '/assets/pisang_asar/kacang_kenari.png',
  '/assets/pisang_asar/telur.png',
  '/assets/pisang_asar/margarin.png',
  '/assets/pisang_asar/gula_aren.png',
  '/assets/pisang_asar/tempe.png',
  '/assets/pisang_asar/mangkok_adonan.png',
  '/assets/pisang_asar/mangkok_aduk.png',
  '/assets/pisang_asar/adonan_putar.png',
  '/assets/pisang_asar/panci.png',
];

const ALL_SFX: string[] = [
  '/assets/sfx/button_click.mp3',
  '/assets/sfx/step_complete.mp3',
];

const UNIQUE_IMAGES = [...new Set(ALL_IMAGES)];

const TOTAL = UNIQUE_IMAGES.length + ALL_SFX.length;


export interface PreloadState {
  progress: number;
  done: boolean;
}

export function useGlobalPreload(): PreloadState {
  const [loaded, setLoaded] = useState(0);

  useEffect(() => {
    let mounted = true;
    let count = 0;

    const tick = () => {
      if (!mounted) return;
      count++;
      setLoaded(count);
    };

    UNIQUE_IMAGES.forEach((src) => {
      const img = new Image();
      img.onload = tick;
      img.onerror = tick;
      img.src = src;
    });

    let audioCtx: AudioContext | null = null;
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      ALL_SFX.forEach(() => tick());
    }

    if (audioCtx) {
      const ctx = audioCtx;
      ALL_SFX.forEach((url) => {
        fetch(url)
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.arrayBuffer();
          })
          .then((ab) => ctx.decodeAudioData(ab))
          .then((decoded) => {
            const key = url.includes('button') ? 'button' : 'step';
            if (!(window as any).__sfxBuffers) (window as any).__sfxBuffers = {};
            (window as any).__sfxBuffers[key] = decoded;
            tick();
          })
          .catch(() => tick());
      });
    }

    return () => { mounted = false; };
  }, []);

  const progress = TOTAL === 0 ? 100 : Math.round((loaded / TOTAL) * 100);
  return { progress, done: progress >= 100 };
}
