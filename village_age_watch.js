javascript:
(function() {
    var mapOverlay = TWMap;
    var tileWidthX = TWMap.tileSize[0];
    var tileWidthY = TWMap.tileSize[1];
    
    function highlightVillagesInGreen() {
        mapOverlay.mapHandler.spawnSector = function(data, sector) {
            // Calls the original function to load the sector data
            mapOverlay.mapHandler._spawnSector(data, sector);
            
            // Draw overlay on the map for each village
            for (var x in data.tiles) {
                x = parseInt(x, 10);
                for (var y in data.tiles[x]) {
                    y = parseInt(y, 10);
                    var village = mapOverlay.villages[(data.x + x) * 1000 + (data.y + y)];
                    if (village) {
                        var el = $('#mapOverlay_canvas_' + sector.x + '_' + sector.y);
                        if (!el.length) {
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
                            
                            sector.appendElement(canvas, 0, 0);
                        }
                    }
                }
            }
        };
        mapOverlay.reload();
    }
    
    // Initialize and call the function to highlight all villages
    if (!mapOverlay.mapHandler._spawnSector) {
        mapOverlay.mapHandler._spawnSector = mapOverlay.mapHandler.spawnSector;
    }
    highlightVillagesInGreen();
})();