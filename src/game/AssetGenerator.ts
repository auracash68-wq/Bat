import Phaser from 'phaser';
import { ObstaclePair } from '../entities/Obstacle';

/**
 * Generates high-resolution, canvas-rendered 2D cartoon vector textures that
 * faithfully recreate every detail of the reference gameplay screenshot:
 * 1. Sky gradient (bright green -> mint green -> soft yellow-orange horizon glow)
 * 2. Layered brown & warm amber distant mountains
 * 3. Back layer dark evergreen pine forest
 * 4. Front layer vibrant bright-green cartoon pine trees
 * 5. Foreground dark-green rounded bushes
 * 6. Vertical wooden tree-trunk obstacles with side bark notches, rich vertical grain,
 *    golden-brown highlights, dark outlines, and detailed oval concentric wood-ring cut ends
 * 7. Checkered brown soil ground with yellow-green grass top border
 * 8. Cute orange cartoon bird with tuft crest, big expressive dual eyes, yellow beak,
 *    cream belly, and 3 flapping wing frames
 */
export class AssetGenerator {
  public static generateAll(scene: Phaser.Scene): void {
    AssetGenerator.createSkyTexture(scene);
    AssetGenerator.createMountainTexture(scene);
    AssetGenerator.createBackForestTexture(scene);
    AssetGenerator.createFrontForestTexture(scene);
    AssetGenerator.createBushesTexture(scene);
    AssetGenerator.createGroundTexture(scene);
    AssetGenerator.createWoodTrunkTexture(scene, 'wood_trunk_top', true);
    AssetGenerator.createWoodTrunkTexture(scene, 'wood_trunk_bottom', false);
    AssetGenerator.createBirdTextures(scene);
    AssetGenerator.createParticleTextures(scene);
  }

  private static createCanvas(
    scene: Phaser.Scene,
    key: string,
    width: number,
    height: number,
    drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
  ): void {
    if (scene.textures.exists(key)) return;
    const canvasTex = scene.textures.createCanvas(key, width, height);
    if (!canvasTex) return;
    const ctx = canvasTex.getContext();
    drawFn(ctx, width, height);
    canvasTex.refresh();
  }

  private static createSkyTexture(scene: Phaser.Scene): void {
    // 1536 x 845 sky area above ground
    AssetGenerator.createCanvas(scene, 'sky_bg', 64, 845, (ctx, w, h) => {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0.0, '#6dc379'); // Top vivid green
      grad.addColorStop(0.32, '#85d67c'); // Mid bright green
      grad.addColorStop(0.54, '#a8e382'); // Light mint green
      grad.addColorStop(0.64, '#d9ea84'); // Soft yellow-green transition
      grad.addColorStop(0.71, '#f5d269'); // Warm golden sunset horizon glow
      grad.addColorStop(0.78, '#e8b455'); // Horizon base behind mountains
      grad.addColorStop(1.0, '#3a2210');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Subtle atmospheric horizontal painted bands matching reference
      ctx.fillStyle = 'rgba(255, 245, 190, 0.14)';
      ctx.fillRect(0, h * 0.56, w, h * 0.06);
      ctx.fillStyle = 'rgba(255, 230, 140, 0.18)';
      ctx.fillRect(0, h * 0.63, w, h * 0.05);
    });
  }

  private static createMountainTexture(scene: Phaser.Scene): void {
    // Tileable 1536 x 320 mountain range
    AssetGenerator.createCanvas(scene, 'mountains_layer', 1536, 320, (ctx, w, h) => {
      // Back distant pale-brown mountain ridge
      ctx.fillStyle = '#c4924c';
      ctx.beginPath();
      ctx.moveTo(0, h);
      const backPeaks = [
        [0, 115], [95, 85], [190, 110], [310, 72], [420, 108],
        [545, 65], [670, 95], [780, 118], [895, 74], [1020, 105],
        [1140, 68], [1260, 110], [1390, 80], [1475, 102], [1536, 115]
      ];
      for (const [px, py] of backPeaks) {
        ctx.lineTo(px, py);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      // Front darker warm-brown mountain ridge with irregular peaks matching reference
      const frontGrad = ctx.createLinearGradient(0, 70, 0, h);
      frontGrad.addColorStop(0, '#966134');
      frontGrad.addColorStop(0.6, '#7b4c25');
      frontGrad.addColorStop(1, '#583418');

      ctx.fillStyle = frontGrad;
      ctx.beginPath();
      ctx.moveTo(0, h);
      const frontPeaks = [
        [0, 130], [70, 100], [145, 135], [240, 115], [350, 95],
        [455, 132], [560, 58], [650, 82], [755, 138], [860, 110],
        [985, 62], [1095, 128], [1205, 98], [1325, 125], [1435, 90], [1536, 130]
      ];
      for (const [px, py] of frontPeaks) {
        ctx.lineTo(px, py);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
    });
  }

  private static drawCartoonPine(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    baseY: number,
    scale: number,
    palette: {
      trunk: string;
      foliageDark: string;
      foliageMain: string;
      foliageHighlight: string;
      outline: string;
    },
    tilt: number = 0
  ): void {
    ctx.save();
    ctx.translate(centerX, baseY);
    ctx.scale(scale, scale);

    // Tree trunk base
    ctx.fillStyle = palette.trunk;
    ctx.strokeStyle = palette.outline;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.rect(-12, -45, 24, 48);
    ctx.fill();
    ctx.stroke();

    // 4 layered serrated pine tiers from bottom to top
    const tiers = [
      { yBottom: -35, yTop: -125, halfW: 62 },
      { yBottom: -85, yTop: -175, halfW: 50 },
      { yBottom: -135, yTop: -220, halfW: 38 },
      { yBottom: -180, yTop: -265, halfW: 25 },
    ];

    tiers.forEach((tier, idx) => {
      const tipX = tilt * (idx + 1) * 2.5;
      ctx.beginPath();
      ctx.moveTo(tipX, tier.yTop);
      // Right sweeping bough with cartoon flared tips
      ctx.quadraticCurveTo(tier.halfW * 0.55, (tier.yTop + tier.yBottom) * 0.5, tier.halfW, tier.yBottom);
      ctx.lineTo(tier.halfW * 0.62, tier.yBottom - 6);
      ctx.lineTo(tier.halfW * 0.35, tier.yBottom + 6);
      ctx.lineTo(0, tier.yBottom - 3);
      ctx.lineTo(-tier.halfW * 0.35, tier.yBottom + 6);
      ctx.lineTo(-tier.halfW * 0.62, tier.yBottom - 6);
      ctx.lineTo(-tier.halfW, tier.yBottom);
      ctx.quadraticCurveTo(-tier.halfW * 0.55, (tier.yTop + tier.yBottom) * 0.5, tipX, tier.yTop);
      ctx.closePath();

      ctx.fillStyle = palette.foliageMain;
      ctx.fill();

      // Left-side shadow for 2D cartoon volume
      ctx.save();
      ctx.clip();
      ctx.fillStyle = palette.foliageDark;
      ctx.beginPath();
      ctx.moveTo(tipX, tier.yTop);
      ctx.lineTo(-tier.halfW - 10, tier.yBottom + 15);
      ctx.lineTo(0, tier.yBottom + 15);
      ctx.closePath();
      ctx.fill();

      // Right-side bright highlight
      ctx.fillStyle = palette.foliageHighlight;
      ctx.beginPath();
      ctx.moveTo(tipX, tier.yTop + 8);
      ctx.lineTo(tier.halfW * 0.72, tier.yBottom - 5);
      ctx.lineTo(tier.halfW * 0.25, tier.yBottom - 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = palette.outline;
      ctx.lineWidth = 2.6;
      ctx.stroke();
    });

    ctx.restore();
  }

  private static createBackForestTexture(scene: Phaser.Scene): void {
    // Deep background dark forest silhouette & mid-dark pine layer (tileable 1536 x 340)
    AssetGenerator.createCanvas(scene, 'forest_back', 1536, 340, (ctx, w, h) => {
      // Dark woodland undergrowth base
      ctx.fillStyle = '#1b3818';
      ctx.fillRect(0, h - 75, w, 75);

      const darkPalette = {
        trunk: '#3c2412',
        foliageDark: '#1c441b',
        foliageMain: '#275924',
        foliageHighlight: '#326d2c',
        outline: '#142d12',
      };

      // Dense row of background pines
      const treeSpecs = [
        { x: 35, s: 0.92, t: -0.5 },
        { x: 110, s: 1.05, t: 0.4 },
        { x: 195, s: 0.88, t: -0.3 },
        { x: 270, s: 1.12, t: 0.2 },
        { x: 355, s: 0.95, t: -0.6 },
        { x: 430, s: 1.08, t: 0.5 },
        { x: 515, s: 0.9, t: -0.2 },
        { x: 595, s: 1.14, t: 0.3 },
        { x: 680, s: 0.96, t: -0.4 },
        { x: 760, s: 1.06, t: 0.4 },
        { x: 845, s: 0.89, t: -0.5 },
        { x: 925, s: 1.1, t: 0.2 },
        { x: 1010, s: 0.94, t: -0.3 },
        { x: 1090, s: 1.12, t: 0.6 },
        { x: 1175, s: 0.91, t: -0.4 },
        { x: 1255, s: 1.05, t: 0.3 },
        { x: 1340, s: 0.97, t: -0.2 },
        { x: 1420, s: 1.11, t: 0.4 },
        { x: 1495, s: 0.93, t: -0.3 },
      ];

      for (const spec of treeSpecs) {
        AssetGenerator.drawCartoonPine(ctx, spec.x, h - 8, spec.s, darkPalette, spec.t);
      }
    });
  }

  private static createFrontForestTexture(scene: Phaser.Scene): void {
    // Foreground vibrant green cartoon pine trees matching the reference screenshot
    AssetGenerator.createCanvas(scene, 'forest_front', 1536, 360, (ctx, w, h) => {
      const brightPalette = {
        trunk: '#59371c',
        foliageDark: '#2f6d26',
        foliageMain: '#439233',
        foliageHighlight: '#61b346',
        outline: '#1b3d16',
      };

      const frontSpecs = [
        { x: 75, s: 1.06, t: 0.4 },
        { x: 185, s: 1.18, t: -0.3 },
        { x: 315, s: 1.24, t: 0.2 },
        { x: 455, s: 1.15, t: -0.5 },
        { x: 580, s: 1.02, t: 0.3 },
        { x: 710, s: 1.12, t: -0.4 },
        { x: 840, s: 1.2, t: 0.5 },
        { x: 965, s: 1.04, t: -0.2 },
        { x: 1085, s: 1.16, t: 0.3 },
        { x: 1220, s: 1.08, t: -0.4 },
        { x: 1355, s: 1.22, t: 0.4 },
        { x: 1475, s: 1.14, t: -0.3 },
      ];

      for (const spec of frontSpecs) {
        AssetGenerator.drawCartoonPine(ctx, spec.x, h - 2, spec.s, brightPalette, spec.t);
      }
    });
  }

  private static createBushesTexture(scene: Phaser.Scene): void {
    // Low dark-green rounded bushes along the ground line matching reference screenshot
    AssetGenerator.createCanvas(scene, 'forest_bushes', 1536, 90, (ctx, _w, h) => {
      const bushClusters = [
        { x: 210, r: [24, 34, 28, 20] },
        { x: 715, r: [22, 32, 38, 26, 18] },
        { x: 1265, r: [26, 42, 34, 24] },
      ];

      bushClusters.forEach((cluster) => {
        ctx.save();
        ctx.fillStyle = '#25521e';
        ctx.strokeStyle = '#11290d';
        ctx.lineWidth = 3.5;

        ctx.beginPath();
        const startX = cluster.x - (cluster.r.length * 26) / 2;
        ctx.moveTo(startX - 20, h);

        cluster.r.forEach((radius, idx) => {
          const cx = startX + idx * 28;
          ctx.arc(cx, h - 6, radius, Math.PI, 0, false);
        });

        ctx.lineTo(startX + cluster.r.length * 28 + 15, h);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Subtle top leaf highlight
        ctx.fillStyle = '#336b29';
        cluster.r.forEach((radius, idx) => {
          const cx = startX + idx * 28;
          ctx.beginPath();
          ctx.arc(cx - 3, h - 10, radius * 0.65, Math.PI * 1.1, Math.PI * 1.85, false);
          ctx.fill();
        });

        ctx.restore();
      });
    });
  }

  private static createGroundTexture(scene: Phaser.Scene): void {
    // Reference ground: yellow-green grass strip on top + 2-row brown checkered soil pattern
    // Height: 84px, Tile width: 256px (8 columns of 32px squares)
    AssetGenerator.createCanvas(scene, 'ground_strip', 256, 84, (ctx, w, h) => {
      // Top dark outline
      ctx.fillStyle = '#2d2612';
      ctx.fillRect(0, 0, w, 3);

      // Yellow-green grass highlight band
      const grassGrad = ctx.createLinearGradient(0, 3, 0, 14);
      grassGrad.addColorStop(0, '#c5be49');
      grassGrad.addColorStop(0.55, '#9e9735');
      grassGrad.addColorStop(1, '#6f5c23');
      ctx.fillStyle = grassGrad;
      ctx.fillRect(0, 3, w, 11);

      // Tiny grass tuft blades along the top
      ctx.strokeStyle = '#8b892e';
      ctx.lineWidth = 1.5;
      for (let gx = 6; gx < w; gx += 14) {
        ctx.beginPath();
        ctx.moveTo(gx, 4);
        ctx.lineTo(gx - 2, 1);
        ctx.moveTo(gx + 4, 4);
        ctx.lineTo(gx + 6, 1);
        ctx.stroke();
      }

      // Dividing border between grass and dirt
      ctx.fillStyle = '#3b2310';
      ctx.fillRect(0, 14, w, 3);

      // Checkered brown dirt blocks (32px wide x 33px tall per row)
      const tileW = 32;
      const tileH = 33.5;
      const lightBrown = '#6d3e1a';
      const darkBrown = '#4b290f';

      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 8; col++) {
          const isLight = (row + col) % 2 === 0;
          ctx.fillStyle = isLight ? lightBrown : darkBrown;
          const tx = col * tileW;
          const ty = 17 + row * tileH;
          ctx.fillRect(tx, ty, tileW, Math.ceil(tileH));

          // Subtle inner bevel for crisp cartoon pixel/vector look
          ctx.fillStyle = isLight ? 'rgba(255, 195, 110, 0.08)' : 'rgba(0, 0, 0, 0.12)';
          ctx.fillRect(tx + 2, ty + 2, tileW - 4, 4);
        }
      }
    });
  }

  private static createWoodTrunkTexture(
    scene: Phaser.Scene,
    key: string,
    isTopHanging: boolean
  ): void {
    const texW = 216;
    const texH = ObstaclePair.TRUNK_HEIGHT;
    const bodyW = ObstaclePair.TRUNK_WIDTH; // 196
    const leftX = (texW - bodyW) / 2; // 10
    const rightX = leftX + bodyW; // 206
    const cutFaceRy = 14; // Vertical radius of the circular wood-end surface

    AssetGenerator.createCanvas(scene, key, texW, texH, (ctx, _w, h) => {
      const cutY = isTopHanging ? h - cutFaceRy - 4 : cutFaceRy + 4;
      const bodyTop = isTopHanging ? 0 : cutY;
      const bodyBottom = isTopHanging ? cutY : h;

      // Side bark stub bumps (matching the organic tree trunk knots in the reference image)
      const leftBumps = isTopHanging
        ? [
            { y: 40, len: 55, protrusion: 5 },
            { y: h - 255, len: 70, protrusion: 6 },
          ]
        : [
            { y: 210, len: 68, protrusion: 6 },
            { y: 520, len: 60, protrusion: 5 },
          ];

      const rightBumps = isTopHanging
        ? [
            { y: 45, len: 52, protrusion: 5 },
            { y: h - 245, len: 64, protrusion: 6 },
          ]
        : [
            { y: 215, len: 64, protrusion: 6 },
            { y: 510, len: 58, protrusion: 5 },
          ];

      // Build outer trunk silhouette path including subtle bark knots
      const traceTrunkPath = () => {
        ctx.beginPath();
        ctx.moveTo(leftX, bodyTop);

        // Down the left edge with bark bumps
        let curY = bodyTop;
        for (const b of leftBumps) {
          if (b.y > bodyTop && b.y + b.len < bodyBottom) {
            ctx.lineTo(leftX, b.y);
            ctx.lineTo(leftX - b.protrusion, b.y + 8);
            ctx.lineTo(leftX - b.protrusion, b.y + b.len - 8);
            ctx.lineTo(leftX, b.y + b.len);
            curY = b.y + b.len;
          }
        }
        ctx.lineTo(leftX, bodyBottom);

        // Bottom edge
        if (isTopHanging) {
          ctx.ellipse(texW / 2, cutY, bodyW / 2, cutFaceRy, 0, Math.PI, 0, true);
        } else {
          ctx.lineTo(rightX, bodyBottom);
        }

        // Up the right edge with bark bumps
        const reversedRight = [...rightBumps].reverse();
        for (const b of reversedRight) {
          if (b.y > bodyTop && b.y + b.len < bodyBottom) {
            ctx.lineTo(rightX, b.y + b.len);
            ctx.lineTo(rightX + b.protrusion, b.y + b.len - 8);
            ctx.lineTo(rightX + b.protrusion, b.y + 8);
            ctx.lineTo(rightX, b.y);
          }
        }
        ctx.lineTo(rightX, bodyTop);

        if (!isTopHanging) {
          ctx.ellipse(texW / 2, cutY, bodyW / 2, cutFaceRy, 0, 0, Math.PI, true);
        } else {
          ctx.lineTo(leftX, bodyTop);
        }
        ctx.closePath();
      };

      // 1. Fill trunk base with rich 3D cylindrical wooden gradient matching reference
      traceTrunkPath();
      const woodGrad = ctx.createLinearGradient(leftX, 0, rightX, 0);
      woodGrad.addColorStop(0.0, '#442611'); // Left dark edge shadow
      woodGrad.addColorStop(0.14, '#5a3317');
      woodGrad.addColorStop(0.32, '#8b5727'); // Warm medium brown
      woodGrad.addColorStop(0.48, '#a66d32'); // Golden-brown center highlight
      woodGrad.addColorStop(0.62, '#8e5a28');
      woodGrad.addColorStop(0.82, '#5e3618');
      woodGrad.addColorStop(1.0, '#3e220e'); // Right dark shadow

      ctx.fillStyle = woodGrad;
      ctx.fill();

      // 2. Clip inside trunk to paint vertical wood grain, highlights, and bark crevices
      ctx.save();
      ctx.clip();

      // Golden vertical highlight bands
      ctx.fillStyle = 'rgba(212, 152, 72, 0.28)';
      ctx.fillRect(leftX + 54, bodyTop, 28, bodyBottom - bodyTop);
      ctx.fillRect(leftX + 94, bodyTop, 16, bodyBottom - bodyTop);

      // Left and right dark bark shading bands
      ctx.fillStyle = 'rgba(38, 18, 6, 0.35)';
      ctx.fillRect(leftX - 8, bodyTop, 24, bodyBottom - bodyTop);
      ctx.fillRect(rightX - 20, bodyTop, 28, bodyBottom - bodyTop);

      // Organic vertical wood grain lines & tapered bark splits
      const grainOffsets = [16, 32, 48, 68, 88, 108, 126, 146, 164, 180];
      grainOffsets.forEach((offset, idx) => {
        const gx = leftX + offset;
        ctx.strokeStyle = idx % 2 === 0 ? 'rgba(42, 20, 7, 0.55)' : 'rgba(58, 30, 11, 0.42)';
        ctx.lineWidth = idx % 3 === 0 ? 3.2 : 2.0;

        ctx.beginPath();
        ctx.moveTo(gx, bodyTop);
        for (let gy = bodyTop + 40; gy < bodyBottom; gy += 65) {
          const wave = Math.sin(gy * 0.025 + idx) * 3.5;
          ctx.lineTo(gx + wave, gy);
        }
        ctx.lineTo(gx, bodyBottom);
        ctx.stroke();
      });

      // Characteristic V-shaped dark bark notch shadows near the cut face (as seen in reference)
      const notchBaseY = isTopHanging ? cutY - 6 : cutY + 6;
      const notchDir = isTopHanging ? -1 : 1;
      const notchPositions = [28, 62, 115, 148, 172];
      ctx.fillStyle = 'rgba(40, 19, 6, 0.55)';
      notchPositions.forEach((nx, i) => {
        const spikeLen = 45 + (i % 3) * 32;
        ctx.beginPath();
        ctx.moveTo(leftX + nx - 5, notchBaseY);
        ctx.lineTo(leftX + nx, notchBaseY + notchDir * spikeLen);
        ctx.lineTo(leftX + nx + 5, notchBaseY);
        ctx.closePath();
        ctx.fill();
      });

      ctx.restore();

      // 3. Draw thick dark-brown cartoon outline around the trunk body
      traceTrunkPath();
      ctx.strokeStyle = '#241205';
      ctx.lineWidth = 4.5;
      ctx.stroke();

      // 4. Draw detailed circular/oval cut wood-end surface at the gap edge
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(texW / 2, cutY, bodyW / 2, cutFaceRy, 0, 0, Math.PI * 2);
      ctx.closePath();

      const endGrad = ctx.createRadialGradient(
        texW / 2 - 12,
        cutY - 2,
        6,
        texW / 2,
        cutY,
        bodyW / 2
      );
      endGrad.addColorStop(0.0, '#d89e58');
      endGrad.addColorStop(0.55, '#b97c3b');
      endGrad.addColorStop(0.85, '#8c5523');
      endGrad.addColorStop(1.0, '#5a3212');

      ctx.fillStyle = endGrad;
      ctx.fill();

      // Concentric wood growth rings on the cut surface
      ctx.strokeStyle = 'rgba(72, 37, 13, 0.65)';
      ctx.lineWidth = 1.8;
      const ringScales = [0.82, 0.62, 0.42, 0.22];
      ringScales.forEach((scale) => {
        ctx.beginPath();
        ctx.ellipse(
          texW / 2,
          cutY,
          (bodyW / 2) * scale,
          cutFaceRy * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      });

      // Outer dark rim of the cut log end
      ctx.beginPath();
      ctx.ellipse(texW / 2, cutY, bodyW / 2, cutFaceRy, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#241205';
      ctx.lineWidth = 4.2;
      ctx.stroke();
      ctx.restore();
    });
  }

  private static createBirdTextures(scene: Phaser.Scene): void {
    // 3 wing-flapping frames matching the cute orange cartoon bird in the reference screenshot:
    // Frame 1: wing down, Frame 2: wing mid, Frame 3: wing up
    const wingAngles = [0.35, 0.0, -0.42];

    wingAngles.forEach((wingPose, idx) => {
      const key = `bird_${idx + 1}`;
      AssetGenerator.createCanvas(scene, key, 112, 96, (ctx, _w, _h) => {
        ctx.save();
        ctx.translate(54, 52);

        // 1. Top head feather crest (double tuft curving back like reference image)
        ctx.fillStyle = '#e04f16';
        ctx.strokeStyle = '#2b1306';
        ctx.lineWidth = 3.2;

        ctx.beginPath();
        ctx.moveTo(-8, -24);
        ctx.quadraticCurveTo(-18, -42, -6, -44);
        ctx.quadraticCurveTo(2, -44, 0, -29);
        ctx.quadraticCurveTo(8, -37, 11, -32);
        ctx.quadraticCurveTo(10, -25, 4, -23);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 2. Main rounded cartoon orange body
        const bodyGrad = ctx.createRadialGradient(-6, -10, 5, 0, 0, 36);
        bodyGrad.addColorStop(0.0, '#ff7724');
        bodyGrad.addColorStop(0.65, '#ea5616');
        bodyGrad.addColorStop(1.0, '#c63d0b');

        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.moveTo(-34, 4);
        ctx.bezierCurveTo(-36, -18, -14, -28, 8, -25);
        ctx.bezierCurveTo(28, -22, 36, -6, 33, 10);
        ctx.bezierCurveTo(29, 25, 6, 28, -14, 24);
        ctx.bezierCurveTo(-27, 21, -33, 12, -34, 4);
        ctx.closePath();
        ctx.fill();

        // 3. Cream / pale-greenish white underbelly (clipped to body)
        ctx.save();
        ctx.clip();
        ctx.fillStyle = '#e4f0c5';
        ctx.beginPath();
        ctx.ellipse(12, 17, 24, 13, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#2b1306';
        ctx.lineWidth = 2.4;
        ctx.stroke();
        ctx.restore();

        // Re-stroke body outline cleanly
        ctx.strokeStyle = '#2b1306';
        ctx.lineWidth = 3.4;
        ctx.beginPath();
        ctx.moveTo(-34, 4);
        ctx.bezierCurveTo(-36, -18, -14, -28, 8, -25);
        ctx.bezierCurveTo(28, -22, 36, -6, 33, 10);
        ctx.bezierCurveTo(29, 25, 6, 28, -14, 24);
        ctx.bezierCurveTo(-27, 21, -33, 12, -34, 4);
        ctx.closePath();
        ctx.stroke();

        // 4. Large expressive cartoon white eyes (pair of overlapping ovals as in reference)
        // Far right eye
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#2b1306';
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.ellipse(21, -9, 7.5, 9.5, 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Near main eye
        ctx.beginPath();
        ctx.ellipse(11, -8, 8.5, 10.5, -0.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Expressive pupils
        ctx.fillStyle = '#1b110c';
        ctx.beginPath();
        ctx.arc(13.5, -8, 2.7, 0, Math.PI * 2);
        ctx.arc(22.5, -9, 2.3, 0, Math.PI * 2);
        ctx.fill();

        // Pure white eye catchlights
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(12.5, -9.2, 1.0, 0, Math.PI * 2);
        ctx.arc(21.7, -10.0, 0.9, 0, Math.PI * 2);
        ctx.fill();

        // Subtle brow line above eyes
        ctx.strokeStyle = '#7c2205';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(2, -16);
        ctx.quadraticCurveTo(13, -21, 25, -17);
        ctx.stroke();

        // 5. Cute yellow cartoon beak (upper + lower mandible)
        ctx.fillStyle = '#ffd43b';
        ctx.strokeStyle = '#2b1306';
        ctx.lineWidth = 2.8;

        // Upper beak
        ctx.beginPath();
        ctx.moveTo(24, -4);
        ctx.quadraticCurveTo(38, -7, 42, -1);
        ctx.quadraticCurveTo(35, 4, 23, 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Lower beak
        ctx.fillStyle = '#f0b418';
        ctx.beginPath();
        ctx.moveTo(24, 2);
        ctx.quadraticCurveTo(34, 3, 38, 6);
        ctx.quadraticCurveTo(31, 10, 23, 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 6. Animated flapping wing on the side
        ctx.save();
        ctx.translate(-12, 4);
        ctx.rotate(wingPose);

        ctx.fillStyle = '#f25c19';
        ctx.strokeStyle = '#2b1306';
        ctx.lineWidth = 3.2;

        ctx.beginPath();
        ctx.moveTo(4, -6);
        ctx.bezierCurveTo(-12, -10, -24, 4, -18, 18);
        ctx.bezierCurveTo(-13, 24, -4, 19, 2, 13);
        ctx.bezierCurveTo(8, 8, 9, -2, 4, -6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Feather detail lines on wing tip
        ctx.beginPath();
        ctx.moveTo(-12, 16);
        ctx.quadraticCurveTo(-7, 10, -4, 6);
        ctx.moveTo(-7, 18);
        ctx.quadraticCurveTo(-3, 12, 0, 8);
        ctx.stroke();

        ctx.restore();
        ctx.restore();
      });
    });

    if (!scene.anims.exists('bird_fly')) {
      scene.anims.create({
        key: 'bird_fly',
        frames: [
          { key: 'bird_1' },
          { key: 'bird_2' },
          { key: 'bird_3' },
          { key: 'bird_2' },
        ],
        frameRate: 14,
        repeat: -1,
      });
    }
  }

  private static createParticleTextures(scene: Phaser.Scene): void {
    // Orange feather / spark particle
    AssetGenerator.createCanvas(scene, 'feather_particle', 18, 10, (ctx, w, h) => {
      ctx.fillStyle = '#ff7b29';
      ctx.strokeStyle = '#3b1806';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(w / 2, h / 2, w / 2 - 2, h / 2 - 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  }
}
