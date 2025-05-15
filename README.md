# Unsecure Websites Scanner

## Popis
Tento program slúži na kontrolu nebezpečných webových stránok. Po načítaní CSV súboru s rizikovými doménami porovnáva aktuálnu navštívenú stránku s týmito doménami. Ak je stránka riziková, zobrazí sa červený banner s varovaním.

Program je optimalizovaný tak, aby kontroloval doménu iba pri zmene URL na stránke (napr. pri navigácii alebo načítaní novej stránky). Vďaka tomu je menej náročný na výkon a efektívnejší.

## Ako nainštalovať
1. Otvorte **Google Chrome**.
2. Prejdite na stránku `chrome://extensions/`.
3. Zapnite **Developer mode** (v pravom hornom rohu).
4. Kliknite na **Load unpacked**.
5. Vyberte priečinok s rozbaleným projektom (kde sa nachádza `manifest.json`).
6. Po nahraní sa rozšírenie zobrazí v zozname.

## Ako používať
1. Kliknite na symbol **puzzle** (rozšírenia) v pravom hornom rohu prehliadača.
2. Vyberte **Unsecure Websites Scanner**.
3. V rozšírení môžete zapnúť alebo vypnúť skener pomocou checkboxu.
4. Pri návšteve rizikovej stránky sa zobrazí červený banner s varovaním.