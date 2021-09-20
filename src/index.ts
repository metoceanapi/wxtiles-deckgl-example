import '@metoceanapi/wxtiles-gl/dist/es/bundle.css';

import { Deck } from '@deck.gl/core';

import { createWxTilesLayerProps, WxServerVarsTimeType, WxTilesLayer } from '@metoceanapi/wxtiles-gl';
import { createDeckGlLayer } from '@metoceanapi/wxtiles-gl';
import { setupWxTilesLib } from '@metoceanapi/wxtiles-gl';
import { DebugTilesLayer } from '@metoceanapi/wxtiles-gl';

async function start() {
	const deckgl = new Deck({
		initialViewState: { latitude: -38, longitude: 176, zoom: 4 },
		controller: true,
		parent: document.getElementById('map')!,
		layers: [
			new DebugTilesLayer({
				id: 'wxdebuglayer',
				data: { color: [255, 0, 0] as [number, number, number] },
				maxZoom: 24,
				minZoom: 0,
				pickable: false,
				tileSize: 256,
			}),
		],
	});

	// ESSENTIAL step to get lib ready.
	await setupWxTilesLib(); // !!! IMPORTANT: make sure fonts (barbs, arrows, etc) are loaded

	const params: WxServerVarsTimeType =
		//
		// ['nz_wave_trki', 'hs_mean', 'Significant wave height'];
		// ['ecwmf.global', 'air.temperature.at-2m', 'temper2m'];
		// ['ecwmf.global', 'air.temperature.at-2m', 'Sea Surface Temperature'];
		// ['ecwmf.global', 'air.humidity.at-2m', 'base'];
		// ['ww3-ecmwf.global', 'wave.height', 'Significant wave height'];
		// ['ww3-ecmwf.global', 'wave.direction.above-8s.peak', 'direction'];
		// ['obs-radar.rain.nzl.national', 'reflectivity', 'rain.EWIS'];
		['ecwmf.global', ['wind.speed.eastward.at-10m', 'wind.speed.northward.at-10m'], 'Wind Speed2'];
	const wxProps = await createWxTilesLayerProps('https://tiles.metoceanapi.com/data/', params);

	const layer = createDeckGlLayer(deckgl, wxProps);

	let isPlaying = false;
	const play = async () => {
		do {
			await layer.nextTimestep();
		} while (isPlaying);
	};

	const nextButton = document.getElementById('next');
	const prevButton = document.getElementById('prev');
	const playButton = document.getElementById('play');
	const removeButton = document.getElementById('remove');
	removeButton?.addEventListener('click', () => layer.remove());
	nextButton?.addEventListener('click', () => layer.nextTimestep());
	prevButton?.addEventListener('click', () => layer.prevTimestep());
	playButton?.addEventListener('click', () => {
		layer.cancel();
		isPlaying = !isPlaying;
		isPlaying && play();
		playButton.innerHTML = isPlaying ? 'Stop' : 'Play';
	});
	layer.nextTimestep();
}

start();
