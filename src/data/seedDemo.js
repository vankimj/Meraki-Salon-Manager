import {
  createClient, createAppointment,
  deleteClient, deleteAppointment,
  fetchDemoClients, fetchDemoAppointments,
} from '../lib/firestore';

// ── Name pools ─────────────────────────────────────────
const FIRST_NAMES = [
  'Ashley','Brianna','Chloe','Danielle','Emily','Faith','Grace','Hannah','Isabella','Jessica',
  'Kayla','Lauren','Mia','Nicole','Olivia','Paige','Rachel','Sarah','Taylor','Victoria',
  'Amber','Brittany','Carmen','Diana','Elena','Fiona','Gina','Heather','Irene','Julia',
  'Kaitlyn','Lisa','Morgan','Natalie','Patricia','Quinn','Rebecca','Stephanie','Tiffany','Vanessa',
  'Wendy','Ximena','Yasmine','Zoe','Alexis','Beth','Crystal','Destiny','Eva','Frances',
  'Georgia','Holly','Iris','Jade','Karen','Leah','Melissa','Nina','Priya','Rosa',
  'Samantha','Tasha','Veronica','Whitney','Abby','Brooklyn','Donna','Elaine','Florence','Gloria',
  'Hazel','Ingrid','Joanna','Kelly','Lana','Monica','Nancy','Renee','Sandra','Tina',
  'Ariel','Cassandra','Dawn','Ebony','Felicia','Gwendolyn','Harper','Imani','Jada','Keisha',
  'Latoya','Monique','Nadia','Octavia','Portia','Regina','Shayla','Tamara','Unique','Valencia',
];

const LAST_NAMES = [
  'Carter','Williams','Martinez','Brooks','Johnson','Thompson','Lee','Davis','Wilson','Moore',
  'Anderson','Taylor','Jackson','Harris','Clark','Robinson','Lewis','Walker','Hall','Young',
  'Nguyen','King','Diaz','Patel','Kim','Walsh','Romano','Scott','Chen','Santos',
  'Rodriguez','Brown','Garcia','Miller','Jones','Smith','Thomas','White','Martin','Allen',
  'Wright','Hill','Mitchell','Turner','Phillips','Campbell','Parker','Evans','Collins','Stewart',
  'Sanchez','Morris','Rogers','Reed','Cook','Morgan','Bell','Murphy','Bailey','Rivera',
  'Cooper','Richardson','Cox','Howard','Ward','Torres','Peterson','Gray','Ramirez','James',
];

const COLUMBUS_STREETS = [
  '142 Polaris Pkwy','831 Bethel Rd','215 Graceland Blvd','5100 N High St','3300 Tremont Rd',
  '1490 Kenny Rd','755 Grandview Ave','4200 Reed Rd','2850 W Dublin Granville Rd','6700 Sawmill Rd',
  '500 W Broad St','1200 Chambers Rd','350 Ackerman Rd','4850 Olentangy River Rd','2200 Henderson Rd',
  '900 Goodale Blvd','3100 Tremont Rd','1750 Fishinger Rd','625 High St','2900 Riverside Dr',
  '4400 N High St','7500 Sawmill Rd','1100 Neil Ave','5200 Brand Rd','340 W Norwich Ave',
  '1650 Old Henderson Rd','3800 Riverside Dr','2100 Fishinger Rd','900 Ackerman Rd','4700 Olentangy River Rd',
];

const COLUMBUS_CITIES = ['Columbus, OH 43214','Columbus, OH 43220','Columbus, OH 43221','Dublin, OH 43017','Columbus, OH 43202','Columbus, OH 43212'];

const CLIENT_NOTES = [
  'Prefers coffin shape, loves bold colors','Gel-X regular, short almond','Sensitive cuticles, be gentle',
  'Monthly regular','Bi-weekly regular','Loves nail art, posts on IG','Gel manicure + paraffin wax always',
  'Structured gel, medium length','Removal + new set monthly','Allergic to certain acrylics — gel only',
  'Corporate client, neutral colors only','Brings tips in cash','Deluxe mani + pedi every month',
  'Nail art enthusiast','Student, loves dip','Lunchtime appointments preferred','French tip, very particular about shape',
  'Sensitive to strong smells','Prefers square shape','Always gets seasonal designs',
  '','','','','', // blanks so ~1/3 have no notes
];

// ── Celebrity data ──────────────────────────────────────
// Photos use randomuser.me portrait URLs (stable, realistic, unique per index)
const CELEBRITIES = [
  { name: 'Beyoncé Knowles-Carter',  instagram: '@beyonce',          birthday: '1981-09-04', picture: 'https://randomuser.me/api/portraits/women/0.jpg',  notes: 'VIP — gel-x coffin, always brings glam inspo' },
  { name: 'Rihanna Fenty',           instagram: '@badgalriri',        birthday: '1988-02-20', picture: 'https://randomuser.me/api/portraits/women/1.jpg',  notes: 'Loves bold nail art and jewel tones, tips 40%' },
  { name: 'Kim Kardashian',          instagram: '@kimkardashian',     birthday: '1980-10-21', picture: 'https://randomuser.me/api/portraits/women/2.jpg',  notes: 'VIP — neutral tones, square shape, very punctual' },
  { name: 'Kylie Jenner',            instagram: '@kyliejenner',       tiktok: '@kyliejenner', birthday: '1997-08-10', picture: 'https://randomuser.me/api/portraits/women/3.jpg',  notes: 'Always photographs nails — loves extra-long coffin' },
  { name: 'Taylor Swift',            instagram: '@taylorswift',       birthday: '1989-12-13', picture: 'https://randomuser.me/api/portraits/women/4.jpg',  notes: 'Red nails always — short square, very sweet' },
  { name: 'Ariana Grande',           instagram: '@arianagrande',      birthday: '1993-06-26', picture: 'https://randomuser.me/api/portraits/women/5.jpg',  notes: 'Short almond, nude tones, gel manicure regular' },
  { name: 'Cardi B',                 instagram: '@iamcardib',         tiktok: '@iamcardib', birthday: '1992-10-11', picture: 'https://randomuser.me/api/portraits/women/6.jpg',  notes: 'Extra long, wild designs — always hypes up the salon' },
  { name: 'Nicki Minaj',             instagram: '@nickiminaj',        birthday: '1982-12-08', picture: 'https://randomuser.me/api/portraits/women/7.jpg',  notes: 'Loves 3D nail art and crystals, long stiletto' },
  { name: 'Selena Gomez',            instagram: '@selenagomez',       birthday: '1992-07-22', picture: 'https://randomuser.me/api/portraits/women/8.jpg',  notes: 'Short oval, soft pinks and nudes, gel polish change' },
  { name: 'Lady Gaga',               instagram: '@ladygaga',          birthday: '1986-03-28', picture: 'https://randomuser.me/api/portraits/women/9.jpg',  notes: 'Always wants something avant-garde and unique' },
  { name: 'Jennifer Lopez',          instagram: '@jlo',               birthday: '1969-07-24', picture: 'https://randomuser.me/api/portraits/women/10.jpg', notes: 'Glam mani + pedi combo, loves gold accents' },
  { name: 'Doja Cat',                instagram: '@dojacat',           tiktok: '@dojacat', birthday: '1995-10-21', picture: 'https://randomuser.me/api/portraits/women/11.jpg', notes: 'Creative nail art enthusiast, loves unexpected designs' },
  { name: 'Lizzo',                   instagram: '@lizzo',             tiktok: '@lizzo', birthday: '1988-04-27', picture: 'https://randomuser.me/api/portraits/women/12.jpg', notes: 'Fun and colorful, loves rhinestones, great energy' },
  { name: 'Megan Thee Stallion',     instagram: '@theestallion',      birthday: '1995-02-15', picture: 'https://randomuser.me/api/portraits/women/13.jpg', notes: 'Extra long coffin, bold patterns — posts everything' },
  { name: 'Zendaya Coleman',         instagram: '@zendaya',           birthday: '1996-09-01', picture: 'https://randomuser.me/api/portraits/women/14.jpg', notes: 'Minimalist and elegant, short almond neutral tones' },
  { name: 'Billie Eilish',           instagram: '@billieeilish',      birthday: '2001-12-18', picture: 'https://randomuser.me/api/portraits/women/15.jpg', notes: 'Dark moody tones, loves black and dark green' },
  { name: 'SZA',                     instagram: '@sza',               birthday: '1989-11-08', picture: 'https://randomuser.me/api/portraits/women/16.jpg', notes: 'Earthy tones, medium coffin, very chill client' },
  { name: 'Halle Bailey',            instagram: '@hallebailey',       birthday: '2000-03-27', picture: 'https://randomuser.me/api/portraits/women/17.jpg', notes: 'Romantic and feminine, loves pastels and pearls' },
  { name: 'Normani',                 instagram: '@normani',           birthday: '1996-05-31', picture: 'https://randomuser.me/api/portraits/women/18.jpg', notes: 'Extra long stiletto, loves metallic and chrome' },
  { name: 'Victoria Beckham',        instagram: '@victoriabeckham',   birthday: '1974-04-17', picture: 'https://randomuser.me/api/portraits/women/19.jpg', notes: 'Nude square, very polished and precise' },
  { name: 'Keke Palmer',             instagram: '@keke',              birthday: '1993-08-26', picture: 'https://randomuser.me/api/portraits/women/20.jpg', notes: 'Fun and playful, loves nail art and bright colors' },
  { name: 'Taraji P. Henson',        instagram: '@tarajiphenson',     birthday: '1970-09-11', picture: 'https://randomuser.me/api/portraits/women/21.jpg', notes: 'Elegant coffin shape, loves burgundy and deep reds' },
  { name: 'Kerry Washington',        instagram: '@kerrywashington',   birthday: '1977-01-31', picture: 'https://randomuser.me/api/portraits/women/22.jpg', notes: 'Classic French tip, very professional' },
  { name: 'Viola Davis',             instagram: '@violadavis',        birthday: '1965-08-11', picture: 'https://randomuser.me/api/portraits/women/23.jpg', notes: 'Short square, classic red or nude — very regal' },
  { name: "Lupita Nyong'o",          instagram: '@lupitanyongo',      birthday: '1983-03-01', picture: 'https://randomuser.me/api/portraits/women/24.jpg', notes: 'Bold colors, loves designs that complement her skin tone' },
  { name: 'Issa Rae',                instagram: '@issarae',           birthday: '1985-01-12', picture: 'https://randomuser.me/api/portraits/women/25.jpg', notes: 'Gel manicure, loves trying new colors each visit' },
  { name: 'Priyanka Chopra',         instagram: '@priyankachopra',    birthday: '1982-07-18', picture: 'https://randomuser.me/api/portraits/women/26.jpg', notes: 'Glamorous, often gets nail art for events' },
  { name: 'Mindy Kaling',            instagram: '@mindykaling',       birthday: '1979-06-24', picture: 'https://randomuser.me/api/portraits/women/27.jpg', notes: 'Fun bright colors, short almond, very chatty and sweet' },
  { name: 'Halle Berry',             instagram: '@halleberry',        birthday: '1966-08-14', picture: 'https://randomuser.me/api/portraits/women/28.jpg', notes: 'Natural and elegant, short square or oval' },
  { name: 'Mary J. Blige',           instagram: '@maryjblige',        birthday: '1971-01-11', picture: 'https://randomuser.me/api/portraits/women/29.jpg', notes: 'Long coffin, loves bronzey golds and warm tones' },
  { name: 'Alicia Keys',             instagram: '@aliciakeys',        birthday: '1981-01-25', picture: 'https://randomuser.me/api/portraits/women/30.jpg', notes: 'Natural and clean, often comes in for spa pedicure' },
  { name: 'Mariah Carey',            instagram: '@mariahcarey',       birthday: '1969-03-27', picture: 'https://randomuser.me/api/portraits/women/31.jpg', notes: 'Long pink coffin, very glamorous, always VIP treatment' },
  { name: 'Britney Spears',          instagram: '@britneyspears',     birthday: '1981-12-02', picture: 'https://randomuser.me/api/portraits/women/32.jpg', notes: 'Pink and playful, loves glitter' },
  { name: 'Paris Hilton',            instagram: '@parishilton',       birthday: '1981-02-17', picture: 'https://randomuser.me/api/portraits/women/33.jpg', notes: 'Long French tip or pale pink, very glam' },
  { name: 'Shakira',                 instagram: '@shakira',           birthday: '1977-02-02', picture: 'https://randomuser.me/api/portraits/women/34.jpg', notes: 'Natural and fun, loves warm earth tones' },
  { name: 'Jennifer Aniston',        instagram: '@jenniferaniston',   birthday: '1969-02-11', picture: 'https://randomuser.me/api/portraits/women/35.jpg', notes: 'Short square, classic nudes — very low maintenance' },
  { name: 'Reese Witherspoon',       instagram: '@reesewitherspoon',  birthday: '1976-03-22', picture: 'https://randomuser.me/api/portraits/women/36.jpg', notes: 'Southern charm, loves pastels and French tips' },
  { name: 'Sofia Vergara',           instagram: '@sofiavergara',      birthday: '1972-07-10', picture: 'https://randomuser.me/api/portraits/women/37.jpg', notes: 'Bold and glamorous, coffin shape, loves deep reds' },
  { name: 'Eva Longoria',            instagram: '@evalongoria',       birthday: '1975-03-15', picture: 'https://randomuser.me/api/portraits/women/38.jpg', notes: 'Classic and elegant, always gets a gel manicure' },
  { name: 'Jessica Alba',            instagram: '@jessicaalba',       birthday: '1981-04-28', picture: 'https://randomuser.me/api/portraits/women/39.jpg', notes: 'Natural and clean beauty, short oval, nudes' },
  { name: 'Hailey Bieber',           instagram: '@haileybieber',      birthday: '1996-11-22', picture: 'https://randomuser.me/api/portraits/women/40.jpg', notes: 'Glazed donut nails! Short square, chrome and shimmer' },
  { name: 'Gigi Hadid',              instagram: '@gigihadid',         birthday: '1995-04-23', picture: 'https://randomuser.me/api/portraits/women/41.jpg', notes: 'Trendy and chic, short almond, always on-trend' },
  { name: 'Bella Hadid',             instagram: '@bellahadid',        tiktok: '@bellahadid', birthday: '1996-10-09', picture: 'https://randomuser.me/api/portraits/women/42.jpg', notes: 'Edgy and fashion-forward, loves dark tones and graphic art' },
  { name: 'Kendall Jenner',          instagram: '@kendalljenner',     birthday: '1995-11-03', picture: 'https://randomuser.me/api/portraits/women/43.jpg', notes: 'Minimal and clean, very short nails, nudes only' },
  { name: 'Emily Ratajkowski',       instagram: '@emrata',            birthday: '1991-06-07', picture: 'https://randomuser.me/api/portraits/women/44.jpg', notes: 'Effortlessly cool, medium length, nudes and terracottas' },
  { name: 'Ashley Graham',           instagram: '@ashleygraham',      birthday: '1987-10-30', picture: 'https://randomuser.me/api/portraits/women/45.jpg', notes: 'Confident and bold, loves color-blocked nails' },
  { name: 'Chrissy Teigen',          instagram: '@chrissyteigen',     birthday: '1985-11-30', picture: 'https://randomuser.me/api/portraits/women/46.jpg', notes: 'Fun and sassy, loves themed nail art for events' },
  { name: 'Gabrielle Union',         instagram: '@gabunion',          birthday: '1972-10-29', picture: 'https://randomuser.me/api/portraits/women/47.jpg', notes: 'Timeless elegance, short coffin or square, reds and nudes' },
  { name: 'Laverne Cox',             instagram: '@lavernecox',        birthday: '1972-05-29', picture: 'https://randomuser.me/api/portraits/women/48.jpg', notes: 'Long and glamorous, loves bold ombre and gradient' },
  { name: 'Kelly Rowland',           instagram: '@kellyrowland',      birthday: '1981-02-11', picture: 'https://randomuser.me/api/portraits/women/49.jpg', notes: 'Classic and chic, medium coffin, rich jewel tones' },
  { name: 'Ciara Harris',            instagram: '@ciara',             birthday: '1985-10-25', picture: 'https://randomuser.me/api/portraits/women/50.jpg', notes: 'Athletic and elegant, loves sculpted medium-length nails' },
  { name: 'Jhené Aiko',              instagram: '@jheneaiko',         birthday: '1988-03-16', picture: 'https://randomuser.me/api/portraits/women/51.jpg', notes: 'Dreamy and ethereal, loves pastel swirls and crystals' },
  { name: 'Summer Walker',           instagram: '@summerwalker',      birthday: '1996-04-11', picture: 'https://randomuser.me/api/portraits/women/52.jpg', notes: 'Long claws always, loves patterns and textures' },
  { name: 'Kehlani',                 instagram: '@kehlani',           birthday: '1995-04-24', picture: 'https://randomuser.me/api/portraits/women/53.jpg', notes: 'Artsy and free-spirited, mismatched nail art lover' },
  { name: 'Teyana Taylor',           instagram: '@teyanataylor',      birthday: '1990-12-10', picture: 'https://randomuser.me/api/portraits/women/54.jpg', notes: 'Fierce and fashion-forward, long stilettos with graphics' },
  { name: 'Tiffany Haddish',         instagram: '@tiffanyhaddish',    birthday: '1979-12-03', picture: 'https://randomuser.me/api/portraits/women/55.jpg', notes: 'Bubbly and fun, loves themed nail art — great tipper' },
  { name: 'Niecy Nash',              instagram: '@niecynash',         birthday: '1970-02-23', picture: 'https://randomuser.me/api/portraits/women/56.jpg', notes: 'Glamorous and bold, loves deep pinks and purples' },
  { name: 'Drew Barrymore',          instagram: '@drewbarrymore',     birthday: '1975-02-22', picture: 'https://randomuser.me/api/portraits/women/57.jpg', notes: 'Bohemian and colorful, loves eclectic nail designs' },
  { name: 'Nicole Kidman',           instagram: '@nicolekidman',      birthday: '1967-06-20', picture: 'https://randomuser.me/api/portraits/women/58.jpg', notes: 'Sophisticated and classic, pale pink oval nails' },
  { name: 'Anne Hathaway',           instagram: '@annehathaway',      birthday: '1982-11-12', picture: 'https://randomuser.me/api/portraits/women/59.jpg', notes: 'Polished and chic, classic colors, medium square' },
  { name: 'Blake Lively',            instagram: '@blakelively',       birthday: '1987-08-25', picture: 'https://randomuser.me/api/portraits/women/60.jpg', notes: 'Effortlessly stylish, loves seasonal nail themes' },
  { name: 'Emma Roberts',            instagram: '@emmaroberts',       birthday: '1991-02-10', picture: 'https://randomuser.me/api/portraits/women/61.jpg', notes: 'Chic and fashion-forward, loves subtle nail art' },
  { name: 'Olivia Wilde',            instagram: '@oliviawilde',       birthday: '1984-03-10', picture: 'https://randomuser.me/api/portraits/women/62.jpg', notes: 'Artsy and expressive, shorter length for film sets' },
  { name: 'Regina Hall',             instagram: '@reginahall',        birthday: '1970-12-12', picture: 'https://randomuser.me/api/portraits/women/63.jpg', notes: 'Glam queen, loves bold reds and long coffin' },
  { name: 'Ari Lennox',              instagram: '@arilennox',         birthday: '1991-03-26', picture: 'https://randomuser.me/api/portraits/women/64.jpg', notes: 'Neo-soul vibes, loves earth tones and natural shapes' },
  { name: 'Tinashe',                 instagram: '@tinashe',           birthday: '1993-02-06', picture: 'https://randomuser.me/api/portraits/women/65.jpg', notes: 'Cool girl, loves minimalist nail art with a twist' },
  { name: 'Ice Spice',               instagram: '@icespice',          tiktok: '@icespicee', birthday: '2000-01-01', picture: 'https://randomuser.me/api/portraits/women/66.jpg', notes: 'Always gets bright orange or hot pink, extra long coffin' },
  { name: 'Tyla',                    instagram: '@tyla',              tiktok: '@tyla', birthday: '2002-01-30', picture: 'https://randomuser.me/api/portraits/women/67.jpg', notes: 'Rising star, loves trendy nail shapes and designs' },
  { name: 'Latto',                   instagram: '@latto777',          birthday: '1998-12-22', picture: 'https://randomuser.me/api/portraits/women/68.jpg', notes: 'Boss vibes, long coffin with custom art' },
  { name: 'Chloe Bailey',            instagram: '@chloebailey',       birthday: '2001-07-01', picture: 'https://randomuser.me/api/portraits/women/69.jpg', notes: 'Always stunning, loves chrome and metallic finishes' },
  { name: 'Halsey',                  instagram: '@halsey',            birthday: '1994-09-29', picture: 'https://randomuser.me/api/portraits/women/70.jpg', notes: 'Alternative and expressive, loves dark colors and art' },
  { name: 'Serena Williams',         instagram: '@serenawilliams',    birthday: '1981-09-26', picture: 'https://randomuser.me/api/portraits/women/71.jpg', notes: 'Champion energy — strong coffin, bold colors' },
  { name: 'Simone Biles',            instagram: '@simonebiles',       birthday: '1997-03-14', picture: 'https://randomuser.me/api/portraits/women/72.jpg', notes: 'Fun and sporty, prefers shorter length for gymnastics' },
  { name: 'Naomi Osaka',             instagram: '@naomiosaka',        birthday: '1997-10-16', picture: 'https://randomuser.me/api/portraits/women/73.jpg', notes: 'Tennis-safe shorter length, loves pastel designs' },
  { name: 'Michelle Obama',          instagram: '@michelleobama',     birthday: '1964-01-17', picture: 'https://randomuser.me/api/portraits/women/74.jpg', notes: 'Former First Lady — classic, dignified, always neutral tones' },
  { name: 'Oprah Winfrey',           instagram: '@oprah',             birthday: '1954-01-29', picture: 'https://randomuser.me/api/portraits/women/75.jpg', notes: 'Power client, monthly standing appt, French tip classic' },
  { name: 'Dolly Parton',            instagram: '@dollyparton',       birthday: '1946-01-19', picture: 'https://randomuser.me/api/portraits/women/76.jpg', notes: 'Famous for her long nails — bright and bedazzled always' },
  { name: 'Katy Perry',              instagram: '@katyperry',         birthday: '1984-10-25', picture: 'https://randomuser.me/api/portraits/women/77.jpg', notes: 'Loves themed nail art, always fun and colorful' },
  { name: 'Demi Lovato',             instagram: '@ddlovato',          birthday: '1992-08-20', picture: 'https://randomuser.me/api/portraits/women/78.jpg', notes: 'Rock-and-roll vibes, loves edgy dark nail art' },
  { name: 'Miley Cyrus',             instagram: '@mileycyrus',        birthday: '1992-11-23', picture: 'https://randomuser.me/api/portraits/women/79.jpg', notes: 'Wild and expressive, ever-changing styles' },
  { name: 'Adele',                   instagram: '@adele',             birthday: '1988-05-05', picture: 'https://randomuser.me/api/portraits/women/80.jpg', notes: 'Classic red or deep wine coffin, very elegant' },
  { name: 'Christina Aguilera',      instagram: '@xtina',             birthday: '1980-12-18', picture: 'https://randomuser.me/api/portraits/women/81.jpg', notes: 'Fierce diva energy, long nails with bold designs' },
  { name: 'Gwen Stefani',            instagram: '@gwenstefani',       birthday: '1969-10-03', picture: 'https://randomuser.me/api/portraits/women/82.jpg', notes: 'Punk-glam, loves graphic nail art, red to match lips' },
  { name: 'Janet Jackson',           instagram: '@janetjackson',      birthday: '1966-05-16', picture: 'https://randomuser.me/api/portraits/women/83.jpg', notes: 'Icon client, classic and classy, medium coffin' },
  { name: 'Amber Rose',              instagram: '@amberrose',         birthday: '1983-10-21', picture: 'https://randomuser.me/api/portraits/women/84.jpg', notes: 'Bold and unapologetic, loves striking statement nails' },
  { name: 'Saweetie',                instagram: '@saweetie',          birthday: '1993-07-02', picture: 'https://randomuser.me/api/portraits/women/85.jpg', notes: 'Icy girl vibes — loves chrome and holographic nails' },
  { name: 'GloRilla',                instagram: '@glorillapimp',      tiktok: '@glorillapimp', birthday: '1999-06-28', picture: 'https://randomuser.me/api/portraits/women/86.jpg', notes: 'Extra and unapologetic, loves wild designs + rhinestones' },
  { name: 'Tems',                    instagram: '@temsbaby',          birthday: '1995-06-11', picture: 'https://randomuser.me/api/portraits/women/87.jpg', notes: 'Afrobeats royalty, loves rich earth tones and warm neutrals' },
  { name: 'H.E.R.',                  instagram: '@hermusicofficial',  birthday: '1997-06-27', picture: 'https://randomuser.me/api/portraits/women/88.jpg', notes: 'Mysterious and cool, loves dark moody nail art' },
  { name: 'Jada Pinkett Smith',      instagram: '@jadapinkettsmith',  birthday: '1971-09-18', picture: 'https://randomuser.me/api/portraits/women/89.jpg', notes: 'Warrior vibes — bold, strong shapes, deep jewel tones' },
  { name: 'Cynthia Erivo',           instagram: '@cynthiaerivo',      birthday: '1987-01-08', picture: 'https://randomuser.me/api/portraits/women/90.jpg', notes: 'Award season regular — always comes in event-ready' },
  { name: 'Fantasia Barrino',        instagram: '@tasiasword',        birthday: '1984-06-30', picture: 'https://randomuser.me/api/portraits/women/91.jpg', notes: 'Idol to Hollywood glam — loves colorful creative designs' },
  { name: 'Jennifer Hudson',         instagram: '@iamjhud',           birthday: '1981-09-12', picture: 'https://randomuser.me/api/portraits/women/92.jpg', notes: 'EGOT winner — always comes in before shows and events' },
  { name: 'Brandy Norwood',          instagram: '@4everbrandy',       birthday: '1979-02-11', picture: 'https://randomuser.me/api/portraits/women/93.jpg', notes: 'R&B royalty, loves soft feminine shapes and pinks' },
  { name: 'Monica Arnold',           instagram: '@monicadenise',      birthday: '1980-10-24', picture: 'https://randomuser.me/api/portraits/women/94.jpg', notes: 'Classic R&B vibes, medium coffin, reds and nudes' },
  { name: 'Ashanti',                 instagram: '@ashanti',           birthday: '1980-10-13', picture: 'https://randomuser.me/api/portraits/women/95.jpg', notes: 'Y2K nostalgia with modern flair, loves metallic tones' },
  { name: 'Cassie Ventura',          instagram: '@cassie',            birthday: '1986-08-26', picture: 'https://randomuser.me/api/portraits/women/96.jpg', notes: 'Model precision, always arrives early, loves clean designs' },
  { name: 'Eva Mendes',              instagram: '@evamendes',         birthday: '1974-03-05', picture: 'https://randomuser.me/api/portraits/women/97.jpg', notes: 'Vintage Hollywood glam, classic red nails always' },
  { name: 'Sandra Oh',               instagram: '@iamsandraoh',       birthday: '1971-07-20', picture: 'https://randomuser.me/api/portraits/women/98.jpg', notes: 'Sophisticated and minimal, loves understated elegance' },
  { name: 'Nathalie Emmanuel',       instagram: '@nathalieemmanuel',  birthday: '1989-03-02', picture: 'https://randomuser.me/api/portraits/women/99.jpg', notes: 'Game of Thrones glam — loves rich jewel-tone designs' },
];

// ── Generate 500 regular clients ────────────────────────
function generateClients() {
  const clients = [];
  const seen = new Set();
  let idx = 0;
  while (clients.length < 500) {
    const fi = idx % FIRST_NAMES.length;
    const li = Math.floor(idx / FIRST_NAMES.length) % LAST_NAMES.length;
    const first = FIRST_NAMES[fi];
    const last  = LAST_NAMES[li];
    const name  = `${first} ${last}`;
    if (!seen.has(name)) {
      seen.add(name);
      const i   = clients.length;
      const phone = `(614) 555-${String(1001 + i).padStart(4, '0')}`;
      const email = `${first.toLowerCase()}.${last.toLowerCase()}${i > 0 ? i : ''}@email.com`;
      const addr  = `${COLUMBUS_STREETS[i % COLUMBUS_STREETS.length]}, ${COLUMBUS_CITIES[i % COLUMBUS_CITIES.length]}`;
      const byear = 1975 + (i * 37 % 28);
      const bmon  = String(1 + (i * 13 % 12)).padStart(2, '0');
      const bday  = String(1 + (i * 7 % 28)).padStart(2, '0');
      clients.push({
        name,
        phone,
        email,
        address: Math.random() > 0.15 ? addr : '',
        birthday: Math.random() > 0.3 ? `${byear}-${bmon}-${bday}` : '',
        notes: CLIENT_NOTES[i % CLIENT_NOTES.length],
        picture: '',
        instagram: Math.random() > 0.5 ? `@${first.toLowerCase()}${last.toLowerCase().slice(0,4)}` : '',
        venmo: Math.random() > 0.4 ? `${first.toLowerCase()}${last.toLowerCase().slice(0,5)}` : '',
        facebook: '',
        tiktok: '',
        instagramTags: [],
        googleReviews: [],
        visits: [],
        _demo: true,
      });
    }
    idx++;
  }
  return clients;
}

// ── Generate 100 celebrity clients ──────────────────────
function generateCelebrities() {
  return CELEBRITIES.map((celeb, i) => ({
    name:       celeb.name,
    phone:      `(614) 555-${String(5001 + i).padStart(4, '0')}`,
    email:      `${celeb.name.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '')}@vip.com`,
    address:    '',
    birthday:   celeb.birthday || '',
    notes:      celeb.notes || '',
    picture:    celeb.picture || '',
    instagram:  celeb.instagram || '',
    facebook:   '',
    tiktok:     celeb.tiktok || '',
    venmo:      '',
    instagramTags: [],
    googleReviews: [],
    visits: [],
    _demo: true,
    _celebrity: true,
  }));
}

// ── Service templates ───────────────────────────────────
const SERVICES = [
  { name: 'Gel-X',                     duration: 75,  price: 75,  weight: 12 },
  { name: 'Structured Gel Manicure',   duration: 65,  price: 55,  weight: 10 },
  { name: 'Gel Manicure',              duration: 40,  price: 45,  weight: 18 },
  { name: 'Signature Manicure',        duration: 40,  price: 35,  weight: 8  },
  { name: 'Deluxe Manicure',           duration: 45,  price: 45,  weight: 6  },
  { name: 'Spa Manicure',              duration: 30,  price: 25,  weight: 10 },
  { name: 'Gel Polish Change',         duration: 30,  price: 32,  weight: 14 },
  { name: 'Spa Pedicure',              duration: 40,  price: 45,  weight: 16 },
  { name: 'Signature Pedicure',        duration: 50,  price: 55,  weight: 10 },
  { name: 'Deluxe Pedicure',           duration: 65,  price: 70,  weight: 6  },
  { name: 'Toe Polish Change',         duration: 20,  price: 20,  weight: 8  },
  { name: 'Nail Art',                  duration: 20,  price: 20,  weight: 7  },
  { name: 'Removal',                   duration: 20,  price: 12,  weight: 9  },
  { name: 'Dip',                       duration: 15,  price: 18,  weight: 6  },
  { name: 'Luxury Paraffin Treatment', duration: 15,  price: 15,  weight: 4  },
];

const TOTAL_WEIGHT = SERVICES.reduce((s, sv) => s + sv.weight, 0);

function pickService() {
  let r = Math.random() * TOTAL_WEIGHT;
  for (const sv of SERVICES) { r -= sv.weight; if (r <= 0) return { ...sv }; }
  return { ...SERVICES[0] };
}

const TECH_NAMES = [
  'Yasmin D','Audriana L','Samantha T','Tess D','Elizabeth L',
  'Yan W','Jen T','Marisela I','Ana P','Jenesis B',
];

// ── Date helpers ────────────────────────────────────────
function today() { return new Date(); }

function offsetDate(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function isWeekend(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.getDay() === 0 || d.getDay() === 6;
}

function randomTimeStr() {
  const hour = 9 + Math.floor(Math.random() * 10); // 9am–6pm
  const min  = Math.random() < 0.5 ? '00' : '30';
  return `${String(hour).padStart(2,'0')}:${min}`;
}

// ── Build appointment list ──────────────────────────────
// celebRecords: array of { id, name } for celebrity clients
function buildAppointments(clientRecords, celebRecords) {
  const appts = [];
  const base  = today();

  // Past 3 months (90 days) — ~700-750 appointments, 30% walk-ins
  for (let d = 1; d <= 90; d++) {
    const date      = offsetDate(base, -d);
    const weekend   = isWeekend(date);
    const countBase = weekend ? 10 : 7;
    const count     = countBase + Math.floor(Math.random() * 4) - 1;
    for (let a = 0; a < count; a++) {
      const isWalkin = Math.random() < 0.30;
      const tech     = TECH_NAMES[Math.floor(Math.random() * TECH_NAMES.length)];
      const svc      = pickService();
      const addAddon = Math.random() < 0.25;
      const services = [svc];
      if (addAddon) {
        const addon = SERVICES.slice(10)[Math.floor(Math.random() * 5)];
        if (addon.name !== svc.name) services.push({ ...addon });
      }
      const duration = services.reduce((s, sv) => s + sv.duration, 0);
      if (isWalkin) {
        appts.push({
          clientId: '', clientName: 'Walk-in',
          techName: tech, services, date,
          startTime: randomTimeStr(), duration, notes: '', status: 'done', _demo: true,
        });
      } else {
        const client = clientRecords[Math.floor(Math.random() * clientRecords.length)];
        appts.push({
          clientId: client.id, clientName: client.name,
          techName: tech, services, date,
          startTime: randomTimeStr(), duration, notes: '', status: 'done', _demo: true,
        });
      }
    }
  }

  // Future 3 months (90 days) — per-tech scheduling, 0-100% utilization per day
  for (let d = 1; d <= 90; d++) {
    const date       = offsetDate(base, d);
    const isWknd     = isWeekend(date);
    const maxPerTech = isWknd ? 7 : 6;
    const salonBusy  = Math.random(); // salon-wide busyness factor for this day

    for (const tech of TECH_NAMES) {
      const techBusy = Math.random(); // this tech's utilization: 0 = off, 1 = fully booked
      const count    = Math.round(salonBusy * techBusy * maxPerTech);
      for (let a = 0; a < count; a++) {
        // Spread times evenly through 9am–6pm based on slot index
        const slotHour  = 9 + Math.floor((a / maxPerTech) * 9);
        const slotMin   = Math.random() < 0.5 ? '00' : '30';
        const startTime = `${String(Math.min(slotHour, 18)).padStart(2, '0')}:${slotMin}`;
        const svc       = pickService();
        const client    = clientRecords[Math.floor(Math.random() * clientRecords.length)];
        appts.push({
          clientId: client.id, clientName: client.name,
          techName: tech, services: [{ ...svc }], date, startTime,
          duration: svc.duration, notes: '', status: 'scheduled', _demo: true,
        });
      }
    }
  }

  // Guarantee every celebrity has 2-4 past appointments + possibly a future one
  for (const celeb of celebRecords) {
    const pastCount = 2 + Math.floor(Math.random() * 3); // 2-4 each
    for (let i = 0; i < pastCount; i++) {
      const daysAgo = 1 + Math.floor(Math.random() * 89);
      const date    = offsetDate(base, -daysAgo);
      const tech    = TECH_NAMES[Math.floor(Math.random() * TECH_NAMES.length)];
      const svc     = pickService();
      appts.push({
        clientId: celeb.id, clientName: celeb.name,
        techName: tech, services: [{ ...svc }], date,
        startTime: randomTimeStr(), duration: svc.duration,
        notes: 'VIP appointment', status: 'done', _demo: true,
      });
    }
    // ~40% chance of a future appointment
    if (Math.random() < 0.4) {
      const daysAhead = 1 + Math.floor(Math.random() * 89);
      const date      = offsetDate(base, daysAhead);
      const tech      = TECH_NAMES[Math.floor(Math.random() * TECH_NAMES.length)];
      const svc       = pickService();
      appts.push({
        clientId: celeb.id, clientName: celeb.name,
        techName: tech, services: [{ ...svc }], date,
        startTime: randomTimeStr(), duration: svc.duration,
        notes: 'VIP appointment', status: 'scheduled', _demo: true,
      });
    }
  }

  return appts;
}

// ── Seed ───────────────────────────────────────────────
export async function seedDemoData(onProgress) {
  const clientDefs = generateClients();
  const celebDefs  = generateCelebrities();

  // Create regular clients
  onProgress?.(`Creating ${clientDefs.length} clients…`);
  const clientRecords = [];
  for (let i = 0; i < clientDefs.length; i++) {
    const id = await createClient(clientDefs[i]);
    clientRecords.push({ id, name: clientDefs[i].name });
    if ((i + 1) % 50 === 0) onProgress?.(`Clients: ${i + 1} / ${clientDefs.length}`);
  }

  // Create celebrity clients
  onProgress?.(`Creating ${celebDefs.length} celebrity clients…`);
  const celebRecords = [];
  for (let i = 0; i < celebDefs.length; i++) {
    const id = await createClient(celebDefs[i]);
    celebRecords.push({ id, name: celebDefs[i].name });
  }

  // Build appointments (all clients pool + celebrity guarantee)
  const allClients = [...clientRecords, ...celebRecords];
  const apptDefs   = buildAppointments(allClients, celebRecords);
  onProgress?.(`Creating ${apptDefs.length} appointments…`);
  for (let i = 0; i < apptDefs.length; i++) {
    await createAppointment(apptDefs[i]);
    if ((i + 1) % 50 === 0) onProgress?.(`Appointments: ${i + 1} / ${apptDefs.length}`);
  }

  onProgress?.('Done!');
  return { clients: clientRecords.length + celebRecords.length, appointments: apptDefs.length };
}

// ── Add future appointments (top-up, no re-seed needed) ─
export async function addFutureAppointments(onProgress) {
  onProgress?.('Fetching demo clients…');
  const demoClients = await fetchDemoClients();
  if (!demoClients.length) {
    onProgress?.('No demo clients found — seed demo data first.');
    return { appointments: 0 };
  }

  const clientRecords = demoClients.map(c => ({ id: c.id, name: c.name }));
  const celebRecords  = demoClients.filter(c => c._celebrity).map(c => ({ id: c.id, name: c.name }));
  const base = today();
  const appts = [];

  // Days 91–120 from today (the 4th month) — same per-tech logic
  for (let d = 91; d <= 120; d++) {
    const date       = offsetDate(base, d);
    const isWknd     = isWeekend(date);
    const maxPerTech = isWknd ? 7 : 6;
    const salonBusy  = Math.random();

    for (const tech of TECH_NAMES) {
      const techBusy = Math.random();
      const count    = Math.round(salonBusy * techBusy * maxPerTech);
      for (let a = 0; a < count; a++) {
        const slotHour  = 9 + Math.floor((a / maxPerTech) * 9);
        const slotMin   = Math.random() < 0.5 ? '00' : '30';
        const startTime = `${String(Math.min(slotHour, 18)).padStart(2, '0')}:${slotMin}`;
        const svc       = pickService();
        const client    = clientRecords[Math.floor(Math.random() * clientRecords.length)];
        appts.push({
          clientId: client.id, clientName: client.name,
          techName: tech, services: [{ ...svc }], date, startTime,
          duration: svc.duration, notes: '', status: 'scheduled', _demo: true,
        });
      }
    }
  }

  // Give each celebrity a ~35% chance at a 4th-month appointment too
  for (const celeb of celebRecords) {
    if (Math.random() < 0.35) {
      const daysAhead = 91 + Math.floor(Math.random() * 29);
      const date      = offsetDate(base, daysAhead);
      const tech      = TECH_NAMES[Math.floor(Math.random() * TECH_NAMES.length)];
      const svc       = pickService();
      appts.push({
        clientId: celeb.id, clientName: celeb.name,
        techName: tech, services: [{ ...svc }], date,
        startTime: randomTimeStr(), duration: svc.duration,
        notes: 'VIP appointment', status: 'scheduled', _demo: true,
      });
    }
  }

  onProgress?.(`Creating ${appts.length} appointments…`);
  for (let i = 0; i < appts.length; i++) {
    await createAppointment(appts[i]);
    if ((i + 1) % 20 === 0) onProgress?.(`Appointments: ${i + 1} / ${appts.length}`);
  }

  onProgress?.('Done!');
  return { appointments: appts.length };
}

// ── Clear ──────────────────────────────────────────────
export async function clearDemoData(onProgress) {
  onProgress?.('Finding demo clients…');
  const demoClients = await fetchDemoClients();
  onProgress?.(`Removing ${demoClients.length} clients…`);
  for (let i = 0; i < demoClients.length; i++) {
    await deleteClient(demoClients[i].id);
    if ((i + 1) % 50 === 0) onProgress?.(`Clients removed: ${i + 1} / ${demoClients.length}`);
  }

  onProgress?.('Finding demo appointments…');
  const demoAppts = await fetchDemoAppointments();
  onProgress?.(`Removing ${demoAppts.length} appointments…`);
  for (let i = 0; i < demoAppts.length; i++) {
    await deleteAppointment(demoAppts[i].id);
    if ((i + 1) % 50 === 0) onProgress?.(`Appointments removed: ${i + 1} / ${demoAppts.length}`);
  }

  onProgress?.('Done!');
  return { clients: demoClients.length, appointments: demoAppts.length };
}
