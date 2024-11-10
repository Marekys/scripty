javascript:
(function() {
    // Check if the user is on the map screen and redirect if not
    if (!window.location.href.includes('screen=map')) {
        console.log("Not on the map screen. Redirecting to map...");
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('screen', 'map');
        window.location.href = currentUrl.toString();
    } else {
        console.log("On map screen, checking if TWMap is defined...");

        // Ensure TWMap is available before proceeding
        if (typeof TWMap !== 'undefined') {
            console.log("TWMap detected. Proceeding with village highlight.");

            var mapOverlay = TWMap;
            var tileWidthX = TWMap.tileSize[0];
            var tileWidthY = TWMap.tileSize[1];

            // Overwrite spawnSector function to highlight villages
            mapOverlay.mapHandler.spawnSector = function(data, sector) {
                console.log("Spawning sector at coordinates:", sector.x, sector.y);
                mapOverlay.mapHandler._spawnSector(data, sector); // Call original sector loading
                
                // Iterate over all tiles in the sector
                for (var x in data.tiles) {
                    x = parseInt(x, 10);
                    for (var y in data.tiles[x]) {
                        y = parseInt(y, 10);
                        var village = mapOverlay.villages[(data.x + x) * 1000 + (data.y + y)];
                        if (village) {
                            var el = $('#mapOverlay_canvas_' + sector.x + '_' + sector.y);
                            if (!el.length) {
                                console.log("Creating new canvas for sector:", sector.x, sector.y);
                                var canvas = document.createElement('canvas');
                                canvas.style.position = 'absolute';
                                canvas.width = mapOverlay.map.scale[0] * mapOverlay.map.sectorSize;
                                canvas.height = mapOverlay.map.scale[1] * mapOverlay.map.sectorSize;
                                canvas.style.zIndex = 10;
                                canvas.className = 'mapOverlay_map_canvas';
                                canvas.id = 'mapOverlay_canvas_' + sector.x + '_' + sector.y;

                                var originXY = mapOverlay.map.pixelByCoord(data.x + x, data.y + y);
                                var originX = (originXY[0] - sector.x) + tileWidthX / 2;
                                var originY = (originXY[1] - sector.y) + tileWidthY / 2;
                                
                                // Draw village as green
                                var ctx = canvas.getContext('2d');
                                ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
                                ctx.fillRect(originX - tileWidthX / 2, originY - tileWidthY / 2, tileWidthX, tileWidthY);
                                console.log(`Highlighted village at (${data.x + x}, ${data.y + y}) in green.`);
                                
                                sector.appendElement(canvas, 0, 0);
                            }
                        }
                    }
                }
            };

            // Reload map to apply highlights
            mapOverlay.reload();
        } else {
            console.error("TWMap is not defined. Please make sure the map is fully loaded before running this script.");
        }
    }
})();
