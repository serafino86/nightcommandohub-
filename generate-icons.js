#!/usr/bin/env node
/**
 * generate-icons.js — Leonardo AI icon generator (3 test icons)
 * Apre il browser, aspetta login utente, poi genera le icone.
 */

const { chromium } = require('/home/enrico/Scrivania/business-leads-ai-automation/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, 'assets', 'war-icons');
fs.mkdirSync(OUT_DIR, { recursive: true });

const TEST_ICONS = [
  {
    name: 'medical-3d',
    label: 'Hospital',
    prompt: 'isometric 3D military field hospital building, red glowing cross on roof, armored walls, dark tactical war aesthetic, neon red accents, painted concept art style, transparent background, no text, no shadow outside, square'
  },
  {
    name: 'nuclear-3d',
    label: 'Nuclear Silo',
    prompt: 'isometric 3D nuclear missile silo building, missile tip emerging from hatch, green radioactive glow, dark apocalyptic military aesthetic, painted concept art style, transparent background, no text, square'
  },
  {
    name: 'datacenter-3d',
    label: 'Data Center',
    prompt: 'isometric 3D server data center building, glowing blue server racks visible through windows, cooling units on roof, dark cyberpunk tactical aesthetic, painted concept art style, transparent background, no text, square'
  }
];

async function waitForAuth(page) {
  console.log('\n🔐 Aspettando login su Leonardo AI...');
  console.log('   Autenticati nel browser, poi premi INVIO qui per continuare.');

  // Aspetta input utente
  await new Promise(resolve => {
    process.stdin.resume();
    process.stdin.once('data', () => {
      process.stdin.pause();
      resolve();
    });
  });
  console.log('✅ Proseguo con la generazione...\n');
}

async function generateIcon(page, icon) {
  console.log(`\n🎨 Generando: ${icon.label}...`);

  try {
    // Naviga alla generazione
    await page.goto('https://app.leonardo.ai/ai-generations', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    await page.waitForTimeout(3000);

    // Cerca il campo prompt (vari selettori possibili)
    const promptField = await page.locator([
      'textarea[placeholder*="prompt" i]',
      'textarea[placeholder*="Describe" i]',
      'textarea[placeholder*="Type" i]',
      'textarea',
    ].join(', ')).first();

    await promptField.click({ timeout: 10000 });
    await promptField.fill('');
    await promptField.type(icon.prompt, { delay: 20 });
    console.log('   ✍️  Prompt inserito');
    await page.waitForTimeout(1000);

    // Cerca bottone Generate
    const generateBtn = await page.locator([
      'button:has-text("Generate")',
      'button[aria-label*="Generate" i]',
      '[data-testid*="generate"]',
    ].join(', ')).first();

    await generateBtn.click({ timeout: 10000 });
    console.log('   🚀 Generazione avviata...');

    // Aspetta risultato (max 90s)
    const imgLocator = page.locator([
      'img[src*="cdn.leonardo.ai"]',
      'img[src*="storage.googleapis.com"]',
      'img[alt*="generated" i]',
    ].join(', ')).first();

    await imgLocator.waitFor({ timeout: 90000 });
    await page.waitForTimeout(2000);

    // Prendi URL prima immagine
    const imgUrl = await imgLocator.getAttribute('src');

    if (!imgUrl) {
      console.log('   ❌ URL immagine non trovata');
      return false;
    }

    // Screenshot del risultato per anteprima
    const previewPath = path.join(OUT_DIR, `PREVIEW_${icon.name}.png`);
    await imgLocator.screenshot({ path: previewPath });
    console.log(`   ✅ Anteprima salvata: assets/war-icons/PREVIEW_${icon.name}.png`);

    return true;
  } catch (err) {
    console.error(`   ❌ Errore per ${icon.label}: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('═'.repeat(55));
  console.log('🎮 NGC War Map — Leonardo AI Icon Generator');
  console.log('═'.repeat(55));
  console.log('\n📋 Icone da generare (3 test):');
  TEST_ICONS.forEach((ic, i) => console.log(`   ${i+1}. ${ic.label}`));

  const { firefox } = require('/home/enrico/Scrivania/business-leads-ai-automation/node_modules/playwright');
  const browser = await firefox.launch({
    headless: false,
    args: ['--start-maximized']
  });

  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  await page.goto('https://app.leonardo.ai/', { waitUntil: 'domcontentloaded' });

  await waitForAuth(page);

  let ok = 0;
  for (const icon of TEST_ICONS) {
    const success = await generateIcon(page, icon);
    if (success) ok++;
    await page.waitForTimeout(3000);
  }

  console.log('\n' + '═'.repeat(55));
  console.log(`✅ Generate: ${ok}/${TEST_ICONS.length}`);
  console.log(`📁 Anteprime in: ${OUT_DIR}`);
  console.log('\n⏸️  Browser aperto per revisione — chiudilo quando hai finito.');
  console.log('═'.repeat(55));

  await new Promise(() => {}); // Tieni browser aperto
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
