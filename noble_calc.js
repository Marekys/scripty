// User Input
if (typeof DEBUG !== 'boolean') DEBUG = false;

// Script Config
var scriptConfig = {
    scriptData: {
        prefix: 'nobleCalculator',
        name: 'Nobles Resource Calculator',
        version: 'v2.0',
        author: 'Mareky',
        authorUrl: 'https://twscripts.dev/',
    },
    translations: {
        en_DK: {
            'Nobles Resource Calculator': 'Nobles Resource Calculator',
            Help: 'Help',
            'Redirecting...': 'Redirecting...',
            'Enter the nobleman amount for the which you want to calculate resources':
                'Enter the nobleman amount for the which you want to calculate resources',
            'Enter the coin price (10-25)': 'Enter the coin price (10-25)',
            'Calculate Resources': 'Calculate Resources',
            Coins: 'Coins',
            Nobles: 'Nobles',
            Wood: 'Wood',
            Clay: 'Clay',
            Iron: 'Iron',
            TOTAL: 'TOTAL',
            'Invalid nobles amount!': 'Invalid nobles amount!',
            'Invalid coin price!': 'Invalid coin price!',
        },
    },
    allowedMarkets: [],
    allowedScreens: ['snob'],
    allowedModes: [],
    isDebug: DEBUG,
    enableCountApi: true,
};

$.getScript(
    `https://twscripts.dev/scripts/twSDK.js?url=${document.currentScript.src}`,
    async function () {
        // Initialize Library
        await twSDK.init(scriptConfig);
        const scriptInfo = twSDK.scriptInfo();
        const isValidScreen = twSDK.checkValidLocation('screen');

        if (isValidScreen) {
            const noblesAmount = 4; // default nobles amount
            const coinPrice = 20; // default coin price

            const nobleCost = BuildingSnob.Modes.train.next_snob;
            const coinCost = BuildingSnob.Modes.train.storage_item;

            const content = prepareContent(noblesAmount, coinPrice, nobleCost, coinCost);

            const customStyle = `
                .ra-grid { display: grid; grid-template-columns: 1fr 3fr; grid-gap: 15px; }
                .ra-input { padding: 3px; font-size: 14px; }
                .ra-table-v2 { border-spacing: 2px !important; border-collapse: separate !important; }
            `;

            twSDK.renderBoxWidget(
                content,
                'raNobleCalculator',
                'ra-tribe-calculator',
                customStyle
            );

            // register action handlers
            onClickCalculateNobles(nobleCost, coinCost);
        } else {
            UI.InfoMessage(twSDK.tt('Redirecting...'));
            twSDK.redirectTo('snob');
        }

        // Action Handler: Handle click
        function onClickCalculateNobles(nobleCost, coinCost) {
            jQuery('#raCalculateResourcesBtn').on('click', function (e) {
                e.preventDefault();

                const noblesAmount = parseInt(jQuery('#raNoblesAmount').val());
                const coinPrice = parseInt(jQuery('#raCoinPrice').val());

                if (noblesAmount <= 0) {
                    UI.ErrorMessage(twSDK.tt('Invalid nobles amount!'));
                    return;
                }

                if (coinPrice < 10 || coinPrice > 25) {
                    UI.ErrorMessage(twSDK.tt('Invalid coin price!'));
                    return;
                }

                const coinsNeeded = twSDK.calculateCoinsNeededForNthNoble(noblesAmount);

                const { woodNeededCoins, stoneNeededCoins, ironNeededCoins } =
                    calculateResourcesForCoins(coinsNeeded, coinCost);
                const {
                    woodNeededNobles,
                    stoneNeededNobles,
                    ironNeededNobles,
                } = calculateResourcesForNobles(noblesAmount, nobleCost);

                const adjustedWoodNeededCoins = woodNeededCoins * coinSale;
                const adjustedStoneNeededCoins = stoneNeededCoins * coinSale;
                const adjustedIronNeededCoins = ironNeededCoins * coinSale;

                const adjustedWoodNeededNobles = woodNeededNobles * coinSale;
                const adjustedStoneNeededNobles = stoneNeededNobles * coinSale;
                const adjustedIronNeededNobles = ironNeededNobles * coinSale;

                const totalWood = adjustedWoodNeededCoins + adjustedWoodNeededNobles;
                const totalStone = adjustedStoneNeededCoins + adjustedStoneNeededNobles;
                const totalIron = adjustedIronNeededCoins + adjustedIronNeededNobles;

                jQuery('#raCoinsAmount').text(
                    twSDK.formatAsNumber(coinsNeeded)
                );

                jQuery('#raWoodNeededCoins').text(
                    twSDK.formatAsNumber(adjustedWoodNeededCoins)
                );
                jQuery('#raStoneNeededCoins').text(
                    twSDK.formatAsNumber(adjustedStoneNeededCoins)
                );
                jQuery('#raIronNeededCoins').text(
                    twSDK.formatAsNumber(adjustedIronNeededCoins)
                );

                jQuery('#raWoodNeededNobles').text(
                    twSDK.formatAsNumber(adjustedWoodNeededNobles)
                );
                jQuery('#raStoneNeededNobles').text(
                    twSDK.formatAsNumber(adjustedStoneNeededNobles)
                );
                jQuery('#raIronNeededNobles').text(
                    twSDK.formatAsNumber(adjustedIronNeededNobles)
                );

                jQuery('#raTotalWood').text(twSDK.formatAsNumber(totalWood));
                jQuery('#raToolStone').text(twSDK.formatAsNumber(totalStone));
                jQuery('#raTotalIron').text(twSDK.formatAsNumber(totalIron));
            });
        }

        // Helper: Prepare content
        function prepareContent(noblesAmount, coinPrice, nobleCost, coinCost) {
            const coinsNeeded = twSDK.calculateCoinsNeededForNthNoble(noblesAmount);

            const coinSale = (100 - coinPrice) / 100;

            const { woodNeededCoins, stoneNeededCoins, ironNeededCoins } =
                calculateResourcesForCoins(coinsNeeded, coinCost);
            const { woodNeededNobles, stoneNeededNobles, ironNeededNobles } =
                calculateResourcesForNobles(noblesAmount, nobleCost);

            const adjustedWoodNeededCoins = woodNeededCoins * coinSale;
            const adjustedStoneNeededCoins = stoneNeededCoins * coinSale;
            const adjustedIronNeededCoins = ironNeededCoins * coinSale;

            const adjustedWoodNeededNobles = woodNeededNobles * coinSale;
            const adjustedStoneNeededNobles = stoneNeededNobles * coinSale;
            const adjustedIronNeededNobles = ironNeededNobles * coinSale;

            const totalWood = adjustedWoodNeededCoins + adjustedWoodNeededNobles;
            const totalStone = adjustedStoneNeededCoins + adjustedStoneNeededNobles;
            const totalIron = adjustedIronNeededCoins + adjustedIronNeededNobles;

            return `
                <div class="ra-grid">    
                    <div>
                        <div class="ra-mb15">
                            <label for="raNoblesAmount">
                                ${twSDK.tt(
                                    'Enter the nobleman amount for the which you want to calculate resources'
                                )}
                            </label>
                            <input class="ra-input" id="raNoblesAmount" type="text" value="${noblesAmount}">
                        </div>
                        <div class="ra-mb15">
                            <label for="raCoinPrice">
                                ${twSDK.tt('Enter the coin price (10-25)')}
                            </label>
                            <input class="ra-input" id="raCoinPrice" type="text" value="${coinPrice}">
                        </div>
                        <a class="btn" href="javascript:void(0)" id="raCalculateResourcesBtn">
                            ${twSDK.tt('Calculate Resources')}
                        </a>
                    </div>    
                    <div>
                        <table class="ra-table ra-table-v2" width="100%">
                            <thead>
                                <tr>
                                    <th class="ra-tal" width="20%"></th>
                                    <th><span class="icon header wood"></span> ${twSDK.tt(
                                        'Wood'
                                    )}</th>
                                    <th><span class="icon header stone"></span> ${twSDK.tt(
                                        'Clay'
                                    )}</th>
                                    <th><span class="icon header iron"></span> ${twSDK.tt(
                                        'Iron'
                                    )}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="ra-tal" width="20%">
                                        <b>${twSDK.tt(
                                            'Coins'
                                        )} <span id="raCoinsAmount">${twSDK.formatAsNumber(
                coinsNeeded
            )}</span></b>
                                    </td>
                                    <td id="raWoodNeededCoins">${twSDK.formatAsNumber(
                                        adjustedWoodNeededCoins
                                    )}</td>
                                    <td id="raStoneNeededCoins">${twSDK.formatAsNumber(
                                        adjustedStoneNeededCoins
                                    )}</td>
                                    <td id="raIronNeededCoins">${twSDK.formatAsNumber(
                                        adjustedIronNeededCoins
                                    )}</td>
                                </tr>
                                <tr>
                                    <td class="ra-tal" width="20%">
                                        <b>${twSDK.tt('Nobles')}</b>
                                    </td>
                                    <td id="raWoodNeededNobles">${twSDK.formatAsNumber(
                                        adjustedWoodNeededNobles
                                    )}</td>
                                    <td id="raStoneNeededNobles">${twSDK.formatAsNumber(
                                        adjustedStoneNeededNobles
                                    )}</td>
                                    <td id="raIronNeededNobles">${twSDK.formatAsNumber(
                                        adjustedIronNeededNobles
                                    )}</td>
                                </tr>
                                <tr>
                                    <td class="ra-tal" width="20%">
                                        <b>${twSDK.tt('TOTAL')}</b>
                                    </td>
                                    <td id="raTotalWood">${twSDK.formatAsNumber(
                                        totalWood
                                    )}</td>
                                    <td id="raToolStone">${twSDK.formatAsNumber(
                                        totalStone
                                    )}</td>
                                    <td id="raTotalIron">${twSDK.formatAsNumber(
                                        totalIron
                                    )}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        // Helper: Calculate resources needed to mint n coins
        function calculateResourcesForCoins(coinsAmount, coinsCost) {
            const { wood, stone, iron } = coinsCost;
            const woodNeededCoins = wood * coinsAmount;
            const stoneNeededCoins = stone * coinsAmount;
            const ironNeededCoins = iron * coinsAmount;

            return { woodNeededCoins, stoneNeededCoins, ironNeededCoins };
        }

        // Helper: Calculate resources needed to educate n nobles
        function calculateResourcesForNobles(noblesAmount, noblesCost) {
            const { wood, stone, iron } = noblesCost;
            const woodNeededNobles = wood * noblesAmount;
            const stoneNeededNobles = stone * noblesAmount;
            const ironNeededNobles = iron * noblesAmount;
            return { woodNeededNobles, stoneNeededNobles, ironNeededNobles };
        }
    }
);