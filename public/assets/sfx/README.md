# 📁 Folder SFX — Efek Suara Game

Tempatkan file audio SFX di folder ini (`public/assets/sfx/`).

## Daftar File yang Dibutuhkan

| File                  | Keterangan                                                    | Dipanggil kapan                                         |
|-----------------------|---------------------------------------------------------------|---------------------------------------------------------|
| `button_click.mp3`    | SFX universal untuk semua tombol di game                      | Setiap `<button>` diklik di seluruh layar game          |
| `step_complete.mp3`   | SFX selesainya satu step pada minigame memasak                | Setiap step 1, 2, 3, dst selesai di semua 4 minigame    |

## Format yang Didukung

- **MP3** (direkomendasikan — kompatibel semua browser)
- OGG juga didukung jika diubah di `useSfx.ts`

## Catatan Teknis

- SFX dikelola oleh hook `src/hooks/useSfx.ts`
- SFX akan **OFF otomatis** jika pemain mematikan "Efek Suara" di Pengaturan
- Volume default:
  - `button_click` → **0.7** (dari 1.0)
  - `step_complete` → **0.85** (dari 1.0)
- Untuk mengubah volume, edit `useSfx.ts` di bagian `audio.volume`

## Minigame Step Count

| Minigame       | Jumlah Step | SFX yang berbunyi        |
|----------------|-------------|--------------------------|
| Klepon         | 5 step      | 5x `step_complete.mp3`   |
| Pie Susu       | 5 step      | 5x `step_complete.mp3`   |
| Samaloyang     | 4 step      | 4x `step_complete.mp3`   |
| Pisang Asar    | 5 step      | 5x `step_complete.mp3`   |
