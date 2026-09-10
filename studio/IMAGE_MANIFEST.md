# Spain 24/7 LinkedIn programme - image manifest

105 posts, 105 distinct photographs. Replaces the 10 stock images that were cycling
across all 255 rows (127 of which had no image at all).

Source: Pexels, matched by subject to each post. The Pexels licence allows free
commercial use with no attribution required; photographer credit is recorded here
anyway so a post can credit by hand if a member wants to.

URL shape: `https://images.pexels.com/photos/<path>?auto=compress&cs=tinysrgb&w=1200&h=630&fit=crop`
Every URL was loaded and confirmed to return exactly 1200x630.

The image lives on the Pexels CDN, not on 247spain.es. `imageSrc()` in `api/_email.js`
passes an absolute URL through untouched and only prefixes the site for legacy
`/photos/...` paths, so both shapes keep working.

Translations share the image of their English parent: the update joins on
(audience, day), so all six language rows of a post carry the same photograph.

Previous values are preserved in the `linkedin_posts_image_backup` table (255 rows).

## Owners (60)

| Day | Post | Image | Photographer | Pexels |
|---|---|---|---|---|
| 1 | The arras contract decides what you bought | A hand signs a formal contract with a pen on a wooden desk. | Pixabay | [261621](https://www.pexels.com/photo/261621/) |
| 2 | Spain taxes your empty holiday home | A white wall with closed shutters, minimalist and symmetrical. | Jan van der Wolf | [37257805](https://www.pexels.com/photo/37257805/) |
| 3 | The 48-hour squatter rule | A close-up of a rusty padlock securing a blue painted wooden door with chain and bolt. | Pixabay | [164425](https://www.pexels.com/photo/164425/) |
| 4 | Cash in Spain now needs paperwork | Close-up of hands exchanging euro banknotes, symbolizing currency trade and financial transactions. | cottonbro studio | [3943726](https://www.pexels.com/photo/3943726/) |
| 5 | Tourist rentals need a licence | A Mediterranean-style house in Valencia, Spain, with colourful walls and greenery. | Joaquin Carfagna | [17573861](https://www.pexels.com/photo/17573861/) |
| 6 | The Nota Simple line buyers never read | Tax forms laid out with a calculator and magnifying glass on a wooden surface. | RDNE Stock project | [7821688](https://www.pexels.com/photo/7821688/) |
| 7 | The 700,000 euro wealth tax line | Stack of 50 euro banknotes, representing wealth and finance concepts. | Pixabay | [259249](https://www.pexels.com/photo/259249/) |
| 8 | Neighbours can ban your tourist let | Classic residential balconies in Barcelona, Spain. | AXP Photography | [19866628](https://www.pexels.com/photo/19866628/) |
| 9 | Moving money to Spain is timing | Close-up of hands exchanging euro banknotes, symbolizing financial transactions and currency exchange. | cottonbro studio | [3943731](https://www.pexels.com/photo/3943731/) |
| 10 | One will clause opts out of Spanish law | A judge in robes writing on a document at a desk in an office library with law books. | Katrin Bolovtsova | [6077296](https://www.pexels.com/photo/6077296/) |
| 11 | Off plan? Demand the bank guarantee | Wooden roof structure in progress with open sky view. | Saeed Khokhar | [8491085](https://www.pexels.com/photo/8491085/) |
| 12 | The 100% tax: the real numbers | Two people working together on tax forms using a calculator at a wooden desk. | Mikhail Nilov | [6963053](https://www.pexels.com/photo/6963053/) |
| 13 | Your NRA number needs renewing yearly | Professional workspace with a laptop, documents, and stationery on a wooden table. | Mikhail Nilov | [7679173](https://www.pexels.com/photo/7679173/) |
| 14 | Fined for the advert itself: the EPC | Solar panels on tiled roofs of houses with chimneys. | Lena Netkach | [38021376](https://www.pexels.com/photo/38021376/) |
| 15 | Buying from a non-resident seller | Close-up of a business handshake over documents. | Ron Lach | [9870223](https://www.pexels.com/photo/9870223/) |
| 16 | Same home, 6% tax or 10%, by region | Historical building in Valencia with a Spanish flag. | Ludovic Delot | [38377925](https://www.pexels.com/photo/38377925/) |
| 17 | IBI: the tax that stays with the house | Close-up of a terracotta tiled roof with a skylight window in Marbella, Spain. | Vasily Kleymenov | [19603110](https://www.pexels.com/photo/19603110/) |
| 18 | Why Spanish banks freeze accounts | A hand tapping a card on a payment terminal for a contactless transaction. | Towfiqu barbhuiya | [11316617](https://www.pexels.com/photo/11316617/) |
| 19 | Community fees: the underestimated cost | Detailed view of a modern apartment building facade with balconies in Calpe, Spain. | Emilio Sanchez Hernandez | [29947889](https://www.pexels.com/photo/29947889/) |
| 20 | Modelo 210 prorates by days | Hands holding a calendar with dates circled, surrounded by documents. | SHVETS production | [9052846](https://www.pexels.com/photo/9052846/) |
| 21 | The notary is not your lawyer | Close-up of hands stamping a document on a wooden desk indoors. | Anna Tarazevich | [6358840](https://www.pexels.com/photo/6358840/) |
| 22 | The absent owner's bill calendar | A set of white window envelopes fanned out on a flat surface, ready for mailing or office use. | Pixabay | [248537](https://www.pexels.com/photo/248537/) |
| 23 | The free banking myth | Close-up of hands using a contactless payment terminal with a card indoors. | Kaboompics.com | [5239818](https://www.pexels.com/photo/5239818/) |
| 24 | Heirs pay before they inherit | A framed legal certificate and Lady Justice figurine on a desk in a law office. | Pavel Danilyuk | [8112198](https://www.pexels.com/photo/8112198/) |
| 25 | Rural land: run these four checks | Scenic view of an old stone farmhouse and tree in Santa Oliva, Spain at sunset. | Antonio Ramon Cuerva Magan | [10778986](https://www.pexels.com/photo/10778986/) |
| 26 | Missed a deadline? Move first | August calendar on a desk with a date marked in red, surrounded by charts. | RDNE Stock project | [7580856](https://www.pexels.com/photo/7580856/) |
| 27 | The vacant-home insurance trap | Close-up of a person holding a home insurance policy on a clipboard. | Mikhail Nilov | [7734672](https://www.pexels.com/photo/7734672/) |
| 28 | Gifts are taxed within 30 days | Close-up of a calendar with red push pins marking important dates. | Towfiqu barbhuiya | [9810172](https://www.pexels.com/photo/9810172/) |
| 29 | Pools and extensions belong on deeds | A cabana beside the pool at a Mediterranean villa. | Ahmet COTUR | [20975734](https://www.pexels.com/photo/20975734/) |
| 30 | What Brexit really changed | High angle crop of a person holding a British passport. | Ethan Wilkinson | [5428705](https://www.pexels.com/photo/5428705/) |
| 31 | Day 184 changes your tax return | Person writing important notes in a desk calendar with a pen, set in an office. | RDNE Stock project | [6172482](https://www.pexels.com/photo/6172482/) |
| 32 | Six coasts, not two | Mediterranean coastline from Villajoyosa, Spain with clear blue skies and rocky cliffs. | Emilio Sanchez Hernandez | [33766992](https://www.pexels.com/photo/33766992/) |
| 33 | The February test for your shortlist | White beach huts on a sandy shore under a cloudy sky, out of season. | Magda Ehlers | [12792931](https://www.pexels.com/photo/12792931/) |
| 34 | The UK form you can't get later | A tidy workspace featuring a laptop, documents, and eyeglasses. | Nataliya Vaitkevich | [8927688](https://www.pexels.com/photo/8927688/) |
| 35 | October is the month owners miss | A sticky note marking a tax deadline on a calendar alongside documents. | Leeloo The First | [8962471](https://www.pexels.com/photo/8962471/) |
| 36 | Renting is a compliance question now | Hands holding pens filling out a home insurance policy document. | Mikhail Nilov | [7736032](https://www.pexels.com/photo/7736032/) |
| 37 | Rent to buy, explained properly | Close-up of a hand handing over a key with a house keychain. | RDNE Stock project | [8292791](https://www.pexels.com/photo/8292791/) |
| 38 | Same flat, two sets of rules | View of residential balconies and plants in Barcelona, Spain. | trip1 Travel | [38510040](https://www.pexels.com/photo/38510040/) |
| 39 | What the flat costs when empty | Bright empty room with wooden floors and large windows, ideal for real estate listings. | Curtis Adams | [3935327](https://www.pexels.com/photo/3935327/) |
| 40 | 200km is not one place | A scenic highway stretches across the vibrant Spanish countryside with mountains in the backdrop. | Philip Ackermann | [878001](https://www.pexels.com/photo/878001/) |
| 41 | Apply for the NIE before you view | Close-up of a European passport and citizen ID card. | Marta Branco | [32081457](https://www.pexels.com/photo/32081457/) |
| 42 | Freehold or leasehold: check before arras | Detailed view of a hand writing a signature on an official document with a ballpoint pen. | Tima Miroshnichenko | [7567600](https://www.pexels.com/photo/7567600/) |
| 43 | The time cost nobody budgets for | Close-up of a woman planning her schedule on a desk calendar in an office setting. | RDNE Stock project | [6170644](https://www.pexels.com/photo/6170644/) |
| 44 | Seven landlord problems, one contract | Hands signing a contract with a blue pen, close-up view. | Kindel Media | [7054502](https://www.pexels.com/photo/7054502/) |
| 45 | Do you need a Spanish accountant? | Close-up of hands organizing tax forms on a desk with a calculator, laptop, and notebook. | Mikhail Nilov | [6963865](https://www.pexels.com/photo/6963865/) |
| 46 | NIE to DNI: the day after the jura | Facade of Palma's City Hall with flags and historic architecture. | Markus Winkler | [3532527](https://www.pexels.com/photo/3532527/) |
| 47 | Citizenship: the clock resets quietly | European passports displayed with euro notes on a map background. | Marta Branco | [29485311](https://www.pexels.com/photo/29485311/) |
| 48 | Why a Spanish credit card says no | A card reader with a receipt printout and an inserted card. | crazy motions | [12920742](https://www.pexels.com/photo/12920742/) |
| 49 | Where you buy decides if you can let | A street in El Castell de Guadalest, Valencia, showing historic architecture. | Peter Vercoelen | [38357057](https://www.pexels.com/photo/38357057/) |
| 50 | Utilities: start at the arras, not keys | Multiple smart electricity meters installed on a residential exterior wall. | Robert So | [12274476](https://www.pexels.com/photo/12274476/) |
| 51 | Spain taxed sunshine until 2019 | Close-up of solar panels on a tiled rooftop under a clear sky. | Budget Bizar | [17762230](https://www.pexels.com/photo/17762230/) |
| 52 | Leaving a Spanish bank is the hard part | Detailed view of a steel keyhole on a door. | Vladimir Srajber | [13963754](https://www.pexels.com/photo/13963754/) |
| 53 | What the noises in your walls mean | Close-up of a plumber's hands installing steel pipes indoors. | Anil Karakaya | [6419128](https://www.pexels.com/photo/6419128/) |
| 54 | The sun is working on your house | Close-up of a weathered wooden surface with peeling paint, showing sun damage. | Atlantic Ambience | [12932660](https://www.pexels.com/photo/12932660/) |
| 55 | 90 percent are covered. Are you? | Close-up of a hand holding a miniature house with greenery in the background. | Jakub Zerdzicki | [29557687](https://www.pexels.com/photo/29557687/) |
| 56 | Rental yield is a postcode decision | Aerial view showing the skyline and coast of Benidorm, Spain. | Emilio Sanchez Hernandez | [13165920](https://www.pexels.com/photo/13165920/) |
| 57 | Lunch at 15.30, dinner at 22.00 | Assorted Spanish tapas dishes served in rustic style on a wooden table. | Bas Linders | [14009280](https://www.pexels.com/photo/14009280/) |
| 58 | The five fees on a Spanish account | Detailed view of 5 and 20 euro banknotes showcasing European currency design. | Lukasz Radziejewski | [7352064](https://www.pexels.com/photo/7352064/) |
| 59 | Squatters read signals, not addresses | Rustic house exterior with a tree and closed shutters in daylight. | nyahmet | [36654622](https://www.pexels.com/photo/36654622/) |
| 60 | The cover most policies leave out | Close-up of a weathered brick building facade showing cracks and deterioration. | Diana | [9562861](https://www.pexels.com/photo/9562861/) |

## Estate agents (30)

| Day | Post | Image | Photographer | Pexels |
|---|---|---|---|---|
| 1 | EPC fines start at the advert | Solar panels on a suburban home, surrounded by greenery and a sunny blue sky. | Robert So | [12243093](https://www.pexels.com/photo/12243093/) |
| 2 | The Nota Simple sizes the mortgage | Close-up of an office desk with tax documents, coins, glasses, and a phone. | MART PRODUCTION | [8872622](https://www.pexels.com/photo/8872622/) |
| 3 | The arras amendment window | Close-up of a hand signing a legal document with a fountain pen, symbolizing signature and agreement. | Pixabay | [48148](https://www.pexels.com/photo/48148/) |
| 4 | An accepted offer binds nobody | Close-up of two businessmen shaking hands outside, symbolizing partnership and agreement. | Ketut Subiyanto | [4963359](https://www.pexels.com/photo/4963359/) |
| 5 | The week after the keys | Smiling couple receiving keys, celebrating a new home purchase indoors. | Kampus Production | [8730048](https://www.pexels.com/photo/8730048/) |
| 6 | Licence first, yield second | Mediterranean villa nestled in lush gardens under a clear blue sky. | Chris R. | [30965188](https://www.pexels.com/photo/30965188/) |
| 7 | Community debt comes off the price | A colourful facade of modern apartments in Barcelona, Spain. | Anton Ivanov | [14917630](https://www.pexels.com/photo/14917630/) |
| 8 | The 3 percent withholding | Flat lay featuring a calculator, pens, and a folder labelled TAXES. | Tara Winstead | [7111516](https://www.pexels.com/photo/7111516/) |
| 9 | Law 57/68 off plan guarantees | A house undergoing major renovations with scaffolding and building materials. | Brett Jordan | [28885519](https://www.pexels.com/photo/28885519/) |
| 10 | The utility bill text message | Close-up view of a row of electricity meters. | Connor Scott McManus | [11924298](https://www.pexels.com/photo/11924298/) |
| 11 | The three fifths tourist let ruling | Close-up of a law book on a wooden desk with scales of justice. | Mikhail Nilov | [8731037](https://www.pexels.com/photo/8731037/) |
| 12 | Completion money, on time | Two pairs of hands exchanging Euro banknotes, symbolizing finance and transaction. | cottonbro studio | [3943729](https://www.pexels.com/photo/3943729/) |
| 13 | Four checks for rural land | A view of rolling hills and farmland in the Andalusian countryside. | Evans Joel | [32573098](https://www.pexels.com/photo/32573098/) |
| 14 | The notary is not their lawyer | Close-up of a legal document with a wooden stamp placed on top. | Markus Spiske | [9858904](https://www.pexels.com/photo/9858904/) |
| 15 | What after-sales actually contains | Portrait of a smiling customer service representative with a headset. | MART PRODUCTION | [7709255](https://www.pexels.com/photo/7709255/) |
| 16 | IBI stays with the house | Classic terracotta roof tiles arranged in neat rows. | Jan van der Wolf | [39279728](https://www.pexels.com/photo/39279728/) |
| 17 | The real price is 12 to 14 more | Hand holding smartphone calculator over tax documents on desk. | Polina Tankilevitch | [6927548](https://www.pexels.com/photo/6927548/) |
| 18 | The 100 percent tax, calmly | Historic city hall in Gijon, Spain, under a blue sky. | Jose Gallardo | [12696255](https://www.pexels.com/photo/12696255/) |
| 19 | Scam red flags for foreign buyers | Tax documents and currency in an envelope with a magnifying glass. | Nataliya Vaitkevich | [8927657](https://www.pexels.com/photo/8927657/) |
| 20 | Why saying no costs referrals | A professional meeting in a modern office with a couple shaking hands with an adviser. | Pavel Danilyuk | [8112160](https://www.pexels.com/photo/8112160/) |
| 21 | The market calendar as a tool | Minimalist calendar with a date marked, highlighting important dates. | Tara Winstead | [8850856](https://www.pexels.com/photo/8850856/) |
| 22 | New build or resale, wrong question | An estate agent shows an unfinished apartment to prospective buyers. | Pavel Danilyuk | [7937363](https://www.pexels.com/photo/7937363/) |
| 23 | NIE timing breaks timelines | Close-up of European passports with a national ID card. | Marta Branco | [32081456](https://www.pexels.com/photo/32081456/) |
| 24 | Paperwork before the search | Close-up of hands organizing documents on a desk with a laptop. | SHVETS production | [7545311](https://www.pexels.com/photo/7545311/) |
| 25 | Handover as a service | Close-up of an estate agent handing over a house key to a client inside a new home. | Pavel Danilyuk | [7937691](https://www.pexels.com/photo/7937691/) |
| 26 | Extensions not on the deeds | Brick house under renovation with an extension in progress. | Brett Jordan | [4692281](https://www.pexels.com/photo/4692281/) |
| 27 | The 2025 rental registration number | Close-up of hands typing on a laptop with an insurance document visible on the desk. | Kindel Media | [7688374](https://www.pexels.com/photo/7688374/) |
| 28 | Brexit answers for UK buyers | Union Jack flag on a flagpole against a clear blue sky in London. | Joanna Zdunczyk | [6476047](https://www.pexels.com/photo/6476047/) |
| 29 | The Modelo 210 answer on the spot | Organized workspace featuring a calendar, tax documents, and planner essentials. | Leeloo The First | [8962475](https://www.pexels.com/photo/8962475/) |
| 30 | What 99 euros a year buys | Aerial view of Alicante marina with boats and historic architecture. | Emilio Sanchez Hernandez | [16046608](https://www.pexels.com/photo/16046608/) |

## Attorneys (15)

| Day | Post | Image | Photographer | Pexels |
|---|---|---|---|---|
| 1 | The arras amendment window | Person in business attire signing a document at a wooden table in an office setting. | cottonbro studio | [6814526](https://www.pexels.com/photo/6814526/) |
| 2 | The choice-of-law clause | A lawyer sitting at a desk with legal books and documents. | Kaboompics.com | [7876088](https://www.pexels.com/photo/7876088/) |
| 3 | Two tax jobs on your buyer | Flat lay of accounting tools including a tax form, phone, and glasses on a desk. | Leeloo The First | [8962451](https://www.pexels.com/photo/8962451/) |
| 4 | Law 57/68 bank guarantees | A construction area with renovation work in progress and large windows. | Brett Jordan | [28184693](https://www.pexels.com/photo/28184693/) |
| 5 | The unbillable email | Man reading a document and talking on a mobile phone at a desk with a laptop. | Michael Burrows | [7129035](https://www.pexels.com/photo/7129035/) |
| 6 | The 3/5 tourist-let ruling | A legal professional's workspace with a Lady Justice statue, documents, and a laptop. | Kaboompics.com | [7876093](https://www.pexels.com/photo/7876093/) |
| 7 | Succession tax's six-month lock | A desk with a planner, a sticky note marked Tax Deadline, and paperwork. | Leeloo The First | [8962478](https://www.pexels.com/photo/8962478/) |
| 8 | The notary is not their lawyer | Close-up view of a person signing an important document with a pen on a wooden table. | Vidal Balielo Jr. | [11296101](https://www.pexels.com/photo/11296101/) |
| 9 | Rural registry vs reality | Rural scene with a farmhouse and field in El Prat de Llobregat, Spain. | Masi | [15733931](https://www.pexels.com/photo/15733931/) |
| 10 | After the file closes | A lawyer reading legal papers at her desk in a modern office. | Kaboompics.com | [7875863](https://www.pexels.com/photo/7875863/) |
| 11 | Gift tax's 30-day clock | Flat lay of financial tools for tax preparation including forms, calculator, and calendar. | Leeloo The First | [6928994](https://www.pexels.com/photo/6928994/) |
| 12 | Debts that stay with the flat | Close-up of a historic apartment building with balconies and shuttered windows. | urtimud.89 | [35839407](https://www.pexels.com/photo/35839407/) |
| 13 | Spain's default heirship ladder | Two lawyers in an office discussing legal matters beside a Lady Justice statue. | Kaboompics.com | [7876144](https://www.pexels.com/photo/7876144/) |
| 14 | Legalise extensions before sale | Bright kitchen extension showing renovation work with tools and materials. | Brett Jordan | [30924413](https://www.pexels.com/photo/30924413/) |
| 15 | The referral logic of care | Close-up of a handshake between colleagues in a professional office setting. | Yan Krukau | [7792841](https://www.pexels.com/photo/7792841/) |
