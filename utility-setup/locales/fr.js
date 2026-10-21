// Français (vous). Same key paths as the English block in ../copy.js.
export default {
  eyebrow: 'Outil gratuit',
  headline: 'Mettre en service l’électricité, l’eau et le reste, dans l’ordre où cela doit se faire',
  body: 'Électricité, eau, gaz, internet et taxe municipale sont cinq démarches distinctes avec cinq guichets différents, et deux d’entre elles ne peuvent pas commencer tant qu’autre chose n’est pas terminé. Cet outil met vos six réponses dans l’ordre et vous dit ce dont chacune a besoin.',
  points: [
    'Six questions, puis une liste ordonnée à imprimer',
    'Elle montre ce qui est bloqué, et par quoi',
    'Les pièces à fournir, l’interlocuteur et la facture que chaque démarche entraîne',
  ],
  cta: 'Établir mon ordre de marche',
  minutes: 'Environ une minute',

  q_stage: 'Où en êtes-vous avec le bien ?',
  q_stage_hint: 'Le travail est le même dans les deux cas. C’est l’ordre qui change, tout comme les personnes à qui vous pouvez encore demander des documents.',
  stage_buying: 'J’achète, ou je viens de signer',
  stage_buying_d: 'Les contrats sont encore au nom du vendeur, ou viennent d’être transférés',
  stage_owner: 'J’en suis déjà propriétaire',
  stage_owner_d: 'Quelque chose est déjà en place et je le modifie ou le corrige',

  q_supply: 'Où en sont les raccordements aujourd’hui ?',
  q_supply_hint: 'Si personne n’est passé au bien récemment, dites-le. C’est en devinant ici que l’on perd un mois.',
  supply_live: 'Raccordé et en service',
  supply_live_d: 'Il y a de l’électricité et de l’eau au bien en ce moment',
  supply_dormant: 'Raccordé, mais le bien est vide depuis longtemps',
  supply_dormant_d: 'Les compteurs sont là. La question est de savoir si l’alimentation est encore active.',
  supply_off: 'Coupé, ou jamais raccordé',
  supply_off_d: 'Rien au compteur, ou pas de compteur du tout',
  supply_unknown: 'Je ne sais pas encore',
  supply_unknown_d: 'Personne n’est allé vérifier',

  q_nie: 'Avez-vous votre NIE ?',
  q_nie_hint: 'Le NIE est le numéro d’identification espagnol des étrangers. C’est sur ce numéro qu’un contrat de fourniture est établi, il décide donc de la part de cette liste que vous pouvez commencer.',
  nie_have: 'Oui, j’ai le certificat',
  nie_applied: 'Demandé, toujours en attente',
  nie_none: 'Pas encore',

  q_account: 'Avez-vous un compte espagnol pour les factures ?',
  q_account_hint: 'Presque tout ici se paie par prélèvement, et plusieurs fournisseurs ne proposent aucun autre moyen.',
  account_spanish: 'Oui, un compte espagnol à mon nom',
  account_foreign: 'J’ai un compte en euros, mais pas espagnol',
  account_foreign_d: 'Un IBAN en euros émis hors d’Espagne',
  account_none: 'Non, pas encore',

  q_type: 'De quel type de bien s’agit-il ?',
  q_type_hint: 'Cela change vos interlocuteurs, et le fait même que certains contrats soient à votre nom.',
  type_apartment: 'Appartement',
  type_apartment_d: 'Dans un immeuble, avec une copropriété',
  type_villa: 'Maison ou villa',
  type_villa_d: 'Sur son propre terrain, en ville ou à proximité',
  type_rural: 'Rural ou isolé',
  type_rural_d: 'Hors des réseaux du village, ou en plein campo',

  q_plan: 'Reprendre l’existant, ou changer de fournisseur ?',
  q_plan_hint: 'Il existe un bon ordre pour cela, et faire l’inverse est la façon dont les gens perdent leur alimentation.',
  plan_takeover: 'Reprendre ce qui est déjà en place',
  plan_takeover_d: 'Le plus rapide, et l’alimentation reste active',
  plan_switch: 'Je veux changer de fournisseur',
  plan_switch_d: 'Un meilleur tarif, ou un fournisseur qui me parle dans ma langue',
  plan_unsure: 'Je n’ai pas encore décidé',

  result_nie: 'Commencez par le NIE. Tout ce qui suit en dépend.',
  result_nie_sub: 'Les contrats d’électricité, d’eau et de gaz sont établis au nom d’une personne disposant d’un numéro d’identification espagnol, et l’ayuntamiento n’enregistre pas de changement de propriétaire sans lui. Vous pouvez quand même réunir les documents et réserver un électricien dès aujourd’hui. Vous ne pouvez simplement rien mettre à votre nom.',
  result_installer: 'Réservez d’abord l’électricien. Le reste se fait par téléphone.',
  result_installer_sub: 'Une alimentation coupée ne peut pas être remise sous tension sur la base d’un certificat que personne n’a encore établi, et l’électricien doit se déplacer pour l’établir. C’est le délai le plus long de cette page, il passe donc en premier, même si personne n’y pense d’emblée.',
  result_account: 'Vous pouvez souscrire les contrats. C’est le paiement qui n’est pas prêt.',
  result_account_sub: 'Rien n’est bloqué ici, sauf les prélèvements, et un contrat de fourniture sans prélèvement qui fonctionne est la version de tout ceci qui échoue dans trois mois, pendant que vous êtes dans un autre pays.',
  result_clear: 'Rien ne vous bloque. Voici l’ordre.',
  result_clear_sub: 'Vous avez les deux éléments dont dépend tout le reste, c’est donc désormais une suite d’étapes et non une attente. Avancez de haut en bas. Les délais longs sont en haut, et ce que vous pouvez faire par téléphone se trouve plus bas.',

  restart: 'Modifier mes réponses',

  who_title: 'À qui vous aurez réellement affaire',
  gates_title: 'Ce qui est bloqué, et par quoi',

  g_gates: 'D’abord. Ce que tout le reste attend',
  g_gates_note: 'Aucune de ces tâches ne concerne directement l’électricité ou l’eau. C’est pourtant à cause d’elles que ces démarches échouent.',
  g_folder: 'Le dossier qu’on vous demandera, à chaque fois',
  g_folder_note: 'Chaque fournisseur et l’ayuntamiento demandent les mêmes quatre pièces. Numérisez-les une fois et gardez-les à un endroit accessible depuis l’étranger.',
  g_elec: 'Électricité',
  g_elec_note: 'Vous choisissez le fournisseur et le contactez directement, par téléphone ou en ligne.',
  g_water: 'Eau',
  g_water_note: 'Le seul service que vous ne choisissez pas. Commencez par l’ayuntamiento, qui vous facture lui-même ou vous indique quelle société détient la concession pour votre rue.',
  g_gas: 'Gaz',
  g_gas_note: 'Seules certaines villes disposent du gaz de ville. Ailleurs, le gaz est un contrat de livraison avec un dépôt local, pas un raccordement.',
  g_net: 'Internet et téléphone',
  g_net_note: 'Rien de juridique n’en dépend, c’est pourquoi il est ici en bas. C’est aussi celui qui demande un rendez-vous avec un technicien, alors calez-le sur un séjour.',
  g_council: 'L’ayuntamiento : ordures ménagères et tout ce qui est facturé au bien',
  g_council_note: 'Personne ne vous envoie de lettre de bienvenue à ce sujet. La taxe existe, que quelqu’un vous en ait parlé ou non.',
  g_dd: 'Les prélèvements. C’est ici que les choses lâchent vraiment',
  g_dd_note: 'Tout ici prend quelques minutes maintenant et est vraiment difficile à corriger depuis un autre pays. Un prélèvement d’électricité rejeté, c’est la façon dont l’alimentation est coupée pendant que le propriétaire est à l’étranger.',
  g_ongoing: 'Ce à quoi chacun de ces contrats vous engage, désormais',
  g_ongoing_note: 'Mettre en place un service prend une journée. Le conserver, c’est un calendrier.',

  shell_note: 'Conseils pratiques pour les propriétaires en Espagne. Ceci n’est pas un conseil juridique.',
  gates_para: 'Ces quatre points ne sont pas indépendants. Le NIE doit exister avant que quoi que ce soit soit mis à votre nom, le compte doit exister avant qu’un prélèvement puisse y être rattaché, et dans un bien privé d’alimentation, le certificat d’installation doit exister avant que quiconque ne remette le courant. Les faire dans un autre ordre, c’est ce qui transforme une semaine en une saison.',
  epc_title: 'Si vous comptez vendre ce bien, ou le louer à un nouveau locataire',
  epc_p1: 'Un certificat de performance énergétique enregistré est obligatoire pour vendre, et pour louer à un nouveau locataire. Il ne fait pas partie de la mise en service des fournitures, et ce n’est pas un fournisseur qui le délivre. Un technicien certifié passe, évalue le bien et enregistre le certificat auprès de votre région.',
  epc_p2: 'La validité maximale est de {default_years} ans, sauf lorsque la note est G, auquel cas elle est de {g_years}. Une grande partie des logements anciens du littoral est classée E, F ou G, donc si le bien est arrivé avec un certificat, repérez la lettre autant que la date avant de supposer le temps dont vous disposez. Renouveler un bail avec le même locataire ne déclenche pas l’obligation en soi. Un nouveau locataire, si.',
  epc_p3: 'Les manquements sont sanctionnés, et l’application relève des régions. Nous n’avons pas pu vérifier les barèmes de sanctions dans le texte de référence, nous n’en publions donc aucun montant ici.',
  source_label: 'Source',
  disclaimer: 'Il s’agit de conseils pratiques, et non de conseils juridiques. Les pratiques diffèrent réellement d’une mairie à l’autre, donc lorsque cette liste vous invite à demander à votre ayuntamiento, c’est parce que la réponse lui appartient et non à nous.',

  gate: {
    contract: 'Mettre un contrat à votre nom',
    contract_waiting: 'En attente du certificat NIE',
    contract_blocked: 'Bloqué tant que vous n’avez pas de NIE',
    open: 'Possible dès maintenant',
    dd: 'Payer par prélèvement',
    dd_foreign: 'Possible, mais testez-le avant de compter dessus',
    dd_blocked: 'Bloqué tant que vous n’avez pas de compte',
    power: 'Faire remettre le courant',
    power_off: 'Il faut d’abord un certificat d’installation',
    power_dormant: 'Il faudra peut-être d’abord un certificat d’installation',
    power_unknown: 'Inconnu tant que personne n’a regardé le compteur',
    power_live: 'Déjà actif, il s’agit donc d’un changement de titulaire',
    water: 'Ouvrir le contrat d’eau',
    water_value: 'À l’ayuntamiento, une fois le NIE et la preuve de propriété en main',
  },

  contacts: {
    electricity: { label: 'Électricité', value: 'Le fournisseur que vous choisissez, directement. Les pannes au compteur relèvent du gestionnaire de réseau, que vous ne choisissez pas.' },
    water: { label: 'Eau', value: 'L’ayuntamiento, ou la société qui détient sa concession. Il n’y a pas de choix de fournisseur.' },
    gas: { label: 'Gaz', value: 'Gaz de ville : le fournisseur, comme pour l’électricité. Bouteilles ou citerne : le dépôt local.' },
    internet: { label: 'Internet', value: 'Le fournisseur, directement. Rien ne passe par la mairie.' },
    refuse: { label: 'Ordures', value: 'L’ayuntamiento. Facturé au bien, selon son propre calendrier.' },
  },

  items: {
    gate_nie_apply: {
      text: 'Demandez le NIE avant de contacter le moindre fournisseur',
      why: 'Les contrats d’électricité, d’eau et de gaz sont établis sur un numéro d’identification espagnol, et l’ayuntamiento n’enregistre pas de changement de propriétaire pour l’eau sans lui. Chaque groupe ci-dessous l’attend.',
    },
    gate_nie_cert: {
      text: 'Ayez le certificat lui-même en main, et prenez-le en photo',
      why: 'Le numéro de référence du rendez-vous n’est pas le document. Les fournisseurs demandent le certificat, et chacun le demande séparément, vous l’enverrez donc quatre ou cinq fois.',
    },
    gate_account_open: {
      text: 'Ouvrez un compte espagnol avant de signer le moindre contrat de fourniture',
      why: 'Le prélèvement est le moyen de paiement habituel ici, et pour certains fournisseurs le seul. Signer d’abord et organiser le paiement ensuite oblige à revenir vers chaque fournisseur un par un, ce qui prend bien plus de temps que de tout régler dans la même conversation.',
    },
    gate_iban_test: {
      text: 'Testez l’IBAN étranger sur une facture avant de compter dessus pour toutes',
      why: 'Selon les règles SEPA, un fournisseur doit accepter tout IBAN en euros. En pratique, des ayuntamientos, des concessionnaires de l’eau et de petits fournisseurs le refusent encore ou le saisissent mal, et l’échec vous parvient sous forme de facture impayée et non de refus.',
    },
    gate_installer: {
      text: 'Réservez l’électricien maintenant, avant de choisir un fournisseur',
      why: 'C’est la visite qui crée le goulot d’étranglement, pas les papiers. Choisir un tarif prend une soirée. Faire venir un électricien sur place en août, non.',
    },
    doc_id: {
      text: 'Passeport ou carte d’identité, et une copie numérisée',
      why: 'On vous le demande à la souscription, puis de nouveau chaque fois que quelqu’un doit modifier quelque chose sur le contrat.',
    },
    doc_nie: {
      text: 'Le certificat NIE',
      why: 'C’est le numéro sur lequel le contrat est établi, et c’est lui qui rattache l’alimentation à vous plutôt qu’à l’adresse.',
    },
    doc_iban: {
      text: 'L’IBAN espagnol, et le nom du titulaire du compte exactement tel que la banque l’écrit',
      why: 'Un nom qui ne correspond pas est l’une des raisons les plus fréquentes pour lesquelles un mandat de prélèvement est rejeté sans bruit plusieurs semaines après la signature.',
    },
    doc_ownership: {
      text: 'La preuve de votre droit sur le bien : l’escritura, une nota simple ou le bail',
      why: 'Les fournisseurs ne mettent pas un contrat au nom de quelqu’un qui ne peut pas montrer de lien avec l’adresse.',
    },
    buy_last_bills: {
      text: 'La dernière facture de chaque fourniture, remise par le vendeur, chez le notaire',
      why: 'Chacune indique la référence du point de fourniture, le CUPS pour l’électricité et le gaz, et la puissance souscrite. Sans elle, vous demandez à un fournisseur de retrouver votre bien par l’adresse, ce qui est lent et aboutit parfois au mauvais bien. Après la signature, le vendeur n’a plus aucune raison de décrocher.',
    },
    buy_paid_up: {
      text: 'Une confirmation écrite du vendeur que toutes les factures de fourniture sont réglées à ce jour',
      why: 'Une dette rattachée à un point de fourniture peut bloquer un changement de titulaire, et c’est bien plus simple à soulever avant la signature qu’à réclamer après.',
    },
    buy_meter_photos: {
      text: 'Une photo de chaque compteur le jour où vous recevez les clés',
      why: 'Le relevé du jour de la remise des clés détermine qui paie ce qui a été consommé avant votre arrivée. Cela prend trente secondes et c’est incontestable.',
    },
    buy_no_cancel: {
      text: 'Demandez par écrit au vendeur de ne rien résilier',
      why: 'Un changement de titulaire sur une alimentation active est un formulaire. Un nouveau raccordement sur une alimentation coupée, c’est un certificat, un technicien et une attente. Les vendeurs résilient pour arrêter leurs propres factures, et ils le font sans prévenir personne.',
    },
    elec_boletin: {
      text: 'Faites établir par un électricien agréé le certificat d’installation électrique, le boletin ou CIE',
      why: 'Un fournisseur ne remet pas sous tension une alimentation coupée depuis longtemps sans certificat à jour, et seul un électricien qui a vu le bien peut l’établir. La durée qui compte comme assez longue est fixée par chaque région, alors partez du principe qu’il vous en faut un et laissez l’électricien vous dire le contraire.',
    },
    elec_supply_point: {
      text: 'Demandez si le point de fourniture existe toujours ou s’il a été abandonné',
      why: 'Une alimentation suspendue, c’est une remise en service. Une alimentation résiliée, c’est un nouveau raccordement, avec un autre prix et un autre délai. Le fournisseur peut vous répondre en une minute à partir du CUPS, et cela change ce que vous devez prévoir au budget.',
    },
    elec_titularidad: {
      text: 'Demandez expressément un cambio de titularidad, un changement de titulaire',
      why: 'L’alimentation reste active et passe à votre nom en une seule étape. Résilier puis souscrire à nouveau coupe l’alimentation, et la récupérer coûte des frais et une attente au lieu d’un simple appel.',
    },
    elec_name_first: {
      text: 'Mettez d’abord le contrat à votre nom. Changez de fournisseur ensuite',
      why: 'Vous ne pouvez pas transférer un contrat qui n’est pas le vôtre, et tant qu’il reste au nom du vendeur, celui-ci peut le résilier sous vos pieds. Changez de titulaire, gardez le tarif pendant une période de facturation, puis changez de fournisseur.',
    },
    elec_three_questions: {
      text: 'Avant de signer le nouveau tarif, posez trois questions : prix fixe ou indexé, durée minimale d’engagement, et montant de l’abonnement',
      why: 'C’est le prix du kilowattheure qui est mis en avant. Pour un bien vide la moitié de l’année, l’abonnement et la durée d’engagement comptent davantage que ce prix.',
    },
    elec_potencia: {
      text: 'Vérifiez la puissance souscrite, la potencia contratada, sur la dernière facture avant de l’accepter',
      why: 'L’abonnement dépend de la puissance souscrite et il est facturé que le bien soit occupé ou vide tout l’hiver. Une résidence secondaire qui garde la puissance dont avait besoin une famille à l’année la paie chaque mois, toute l’année, et la baisser tient en un appel.',
    },
    elec_phase: {
      text: 'Demandez si l’alimentation est monophasée ou triphasée, et ce que l’installation supporte réellement',
      why: 'Pompe de piscine, climatisation et plaque à induction en même temps ne représentent pas la charge pour laquelle une vieille maison a été câblée. Augmenter la puissance souscrite au-delà de ce que permet l’installation implique un nouveau certificat et peut-être des travaux au compteur, et mieux vaut avoir cette conversation avant le départ des artisans.',
    },
    elec_block: {
      text: 'Demandez à l’administrador de fincas ce qui est facturé à l’immeuble et ce qui vous est facturé',
      why: 'L’éclairage des escaliers, l’ascenseur et la pompe de la piscine relèvent de l’alimentation de la copropriété et vous sont refacturés dans les charges. Seul votre propre compteur doit figurer sur votre contrat.',
    },
    elec_no_mains: {
      text: 'S’il n’y a pas de raccordement au réseau, obtenez une étude écrite et un prix avant de supposer qu’il y en aura un',
      why: 'Amener une nouvelle alimentation jusqu’à un terrain isolé est un projet avec un devis, pas une modification de contrat. Les propriétaires le découvrent après l’achat, et à ce moment le solaire avec batteries est souvent la réponse honnête, et non une simple alternative.',
    },
    water_counter: {
      text: 'Rendez-vous à l’ayuntamiento, déclarez le changement de propriétaire et ouvrez le nouveau contrat',
      why: 'C’est le seul service qui ne figure sur aucun comparateur. La mairie vous facture directement ou vous indique quelle société détient la concession pour votre rue, et il n’existe pas d’autre option à comparer.',
    },
    water_folder: {
      text: 'Apportez le même dossier. Pièce d’identité, NIE, IBAN et preuve de propriété',
      why: 'On vous y demande exactement ce que demandent les fournisseurs. Un document manquant ici signifie un second déplacement, pas un simple courriel de suivi.',
    },
    water_no_connection: {
      text: 'S’il n’y a aucun raccordement à l’eau, commencez par là avant tout le reste de cette page',
      why: 'Raccorder un bien qui ne l’a jamais été relève de travaux municipaux et non d’une modification de contrat, et cela se compte en mois plutôt qu’en jours. Tout le reste de la liste peut l’attendre plus facilement que l’inverse.',
    },
    water_own_meter: {
      text: 'Vérifiez si votre appartement a son propre compteur ou si l’immeuble en partage un',
      why: 'Certains immeubles ont un seul contrat d’eau et répartissent la dépense dans les comptes de la copropriété. Si c’est votre cas, vous n’avez rien à souscrire, et le risque devient de payer une facture qui n’a jamais été la vôtre.',
    },
    water_well: {
      text: 'Si l’eau vient d’un puits, d’un forage ou d’une citerne, demandez à voir l’autorisation de prélèvement',
      why: 'Le prélèvement d’eau souterraine est autorisé par l’autorité de bassin, la Confederacion Hidrografica. Soit l’autorisation a été transmise avec le bien, soit elle n’a jamais existé, et la pompe ne permet pas de le savoir.',
    },
    water_deposit: {
      text: 'S’il y a une citerne et des livraisons, renseignez-vous sur le livreur et le délai en août',
      why: 'Une citerne qui se vide la semaine où toute la côte remplit les siennes est le genre de problème qui n’a pas de solution administrative.',
    },
    water_meter_access: {
      text: 'Demandez où se trouve le compteur et si le releveur peut réellement y accéder',
      why: 'Un compteur derrière un portail fermé reçoit des relevés estimés. Les estimations finissent par être corrigées, et la régularisation arrive en une seule facture plutôt qu’en plusieurs.',
    },
    water_other_charges: {
      text: 'Demandez à l’ayuntamiento ce qui est facturé d’autre à ce bien',
      why: 'La taxe d’ordures, et parfois la redevance d’assainissement, figurent sur la facture d’eau ou viennent du même service. Poser la question une fois au guichet coûte bien moins cher que de l’apprendre par une mise en demeure.',
    },
    gas_mains: {
      text: 'Vérifiez si la rue est desservie par le gaz de ville avant de chercher un tarif gaz',
      why: 'Le gaz de ville ne dessert qu’une minorité d’adresses espagnoles. Dans une grande partie du pays, la réponse honnête est qu’il n’y a rien à souscrire, et la question est réglée.',
    },
    gas_bottles: {
      text: 'S’il fonctionne en bouteilles, trouvez le dépôt local et demandez comment se passe la livraison quand personne n’est là',
      why: 'Un contrat de bouteilles se conclut avec un dépôt, pas avec un fournisseur national. Une livraison qui exige quelqu’un à la porte ne sert pas à grand-chose à un propriétaire qui vient deux fois par an, et un arrangement avec le voisin est ce sur quoi la plupart finissent par compter.',
    },
    gas_inspection: {
      text: 'S’il y a une installation de gaz, notez au calendrier le contrôle périodique de sécurité',
      why: 'Une installation de gaz doit être contrôlée selon un cycle fixe, à vos frais, et le contrôleur doit pouvoir entrer. C’est une tâche à caler sur un séjour, pas une surprise à découvrir pendant que vous êtes dans un autre pays.',
    },
    gas_old_install: {
      text: 'Attendez-vous à un contrôle avant la remise en service d’une ancienne installation de gaz',
      why: 'Une installation restée inutilisée pendant des années ne se rallume pas simplement, et le découvrir le jour où vous arrivez en famille, c’est le mauvais jour.',
    },
    gas_combined: {
      text: 'Demandez un prix pour une offre combinée gaz et électricité, puis pour chacun séparément',
      why: 'Les offres combinées sont courantes ici et parfois vraiment moins chères. Parfois, ce sont deux prix moyens au lieu de deux bons prix, et le seul moyen de le savoir est de demander les deux.',
    },
    net_coverage: {
      text: 'Vérifiez la couverture à l’adresse exacte, pas pour la ville',
      why: 'La disponibilité de la fibre change d’une rue à l’autre sur la côte et s’arrête net à la sortie des villages. Que la ville soit couverte ne veut pas dire grand-chose.',
    },
    net_keep_line: {
      text: 'Gardez la ligne existante active jusqu’à ce que la nouvelle fonctionne',
      why: 'Résilier d’abord vous laisse sans connexion et sans moyen de gérer quoi que ce soit à distance, et une nouvelle installation implique un second rendez-vous avec un technicien auquel vous devez être présent.',
    },
    net_min_term: {
      text: 'Vérifiez la durée minimale d’engagement, et ce qu’il advient du routeur si vous résiliez',
      why: 'Les durées d’engagement sont courantes ici et l’équipement doit en général être restitué. Les deux coûtent bien moins cher à connaître maintenant qu’au moment de partir.',
    },
    net_block_fibre: {
      text: 'Demandez à l’administrador si l’immeuble a déjà la fibre jusqu’à la porte, et par où doivent passer les nouveaux câbles',
      why: 'Les copropriétés ont des règles sur les perçages et les goulottes, et un technicien qui les ignore se fait arrêter par un voisin en plein travail.',
    },
    net_no_fibre: {
      text: 'Demandez quelle est la solution si la fibre n’arrive pas jusqu’à vous',
      why: 'La boucle radio et les routeurs mobiles sont la réponse habituelle à l’intérieur des terres. L’équipement et le contrat sont différents, alors mieux vaut le savoir avant de vous engager pour quelque chose qui ne pourra pas être installé.',
    },
    council_register: {
      text: 'Déclarez le changement de propriétaire pour la taxe d’ordures, la tasa de basura',
      why: 'Elle est facturée au bien selon le calendrier propre à la commune, et tant que personne ne prévient la mairie, la facture continue d’aller à l’ancien propriétaire. La dette, elle, ne le suit pas.',
    },
    council_billing: {
      text: 'Demandez comment et à quelle fréquence elle est facturée, car cela varie d’une commune à l’autre',
      why: 'Certaines la facturent avec l’eau, d’autres une fois par an séparément, d’autres avec l’IBI. Il n’y a pas de réponse nationale, seulement celle de votre mairie, et c’est une question de deux minutes au guichet.',
    },
    council_dd: {
      text: 'Mettez en place le prélèvement pendant que vous êtes sur place',
      why: 'Une taxe municipale impayée passe en procédure de recouvrement avec une majoration, et la première nouvelle que vous en avez est une lettre en espagnol arrivée dans un bien où vous n’êtes pas.',
    },
    council_ibi: {
      text: 'Pendant que vous êtes au guichet, vérifiez que l’IBI est prélevé sur le même compte',
      why: 'Il vient du même service, il est facturé une fois par an, et un paiement annuel est exactement le genre de paiement qu’un propriétaire à l’étranger oublie.',
    },
    council_community: {
      text: 'Demandez si la copropriété gère la collecte des ordures pour l’immeuble',
      why: 'Les conteneurs peuvent très bien être communs. La taxe reste la vôtre, et les deux sont assez souvent confondus pour que cela vaille dix secondes.',
    },
    dd_same_time: {
      text: 'Mettez en place la domiciliacion dans la même conversation que le contrat',
      why: 'L’ajouter après coup est une démarche distincte auprès de chaque fournisseur, un par un, et plusieurs n’acceptent l’instruction que de vous et non d’une banque.',
    },
    dd_name: {
      text: 'Indiquez le nom du titulaire du compte exactement comme la banque l’enregistre',
      why: 'Un mandat à un nom légèrement différent est un mandat rejeté, et le rejet apparaît sous forme de facture impayée plutôt que d’un message d’erreur que l’on vous aurait signalé.',
    },
    dd_date: {
      text: 'Attendez-vous à ce que le fournisseur choisisse la date de prélèvement, pas vous',
      why: 'Les fournisseurs espagnols fixent leurs propres dates de prélèvement et ne sont pas tenus de s’adapter à votre date de salaire dans un autre pays. Un compte alimenté selon un rythme qui convient chez vous est un compte vide le jour où ils prélèvent.',
    },
    dd_buffer: {
      text: 'Laissez une réserve permanente sur le compte plutôt que le montant exact',
      why: 'Les factures varient avec la consommation et la saison. Un prélèvement de quelques euros de plus que ce que vous avez laissé est rejeté comme n’importe quel autre.',
    },
    dd_returned: {
      text: 'Traitez un prélèvement d’électricité rejeté comme une urgence, pas comme de l’administratif',
      why: 'Un prélèvement rejeté, c’est la façon dont l’alimentation est coupée pendant que le propriétaire est à l’étranger. La remise en service est lente et payante, et pendant ce temps le réfrigérateur, l’alarme et le déshumidificateur sont arrêtés sans que personne ne soit là pour le remarquer.',
    },
    dd_receipts: {
      text: 'Téléchargez et conservez le justificatif de paiement de chaque prélèvement',
      why: 'Chacun porte la référence client dont le fournisseur a besoin avant de modifier quoi que ce soit. C’est le seul document qui permet de transférer un prélèvement plus tard, et il est bien plus facile à enregistrer maintenant qu’à reconstituer.',
    },
    dd_change_bank: {
      text: 'Si vous changez un jour de banque, prévoyez de prévenir vous-même chaque fournisseur',
      why: 'Il n’existe pas ici de service automatique de changement de domiciliation comme dans certains pays. Vous transmettez le changement à chaque fournisseur, certains ne l’acceptent que du client, et tant que chacun ne l’a pas confirmé, rien n’a réellement changé.',
    },
    dd_old_account: {
      text: 'Laissez l’ancien compte approvisionné pendant une période de facturation complète après tout changement',
      why: 'Si un paiement arrive à échéance peu après votre demande de changement, le fournisseur peut encore le prélever sur l’ancien compte. Le changement n’est réel qu’une fois que vous avez vu un cycle complet passer sur le nouveau.',
    },
    dd_first_bill: {
      text: 'Vérifiez la première facture après tout changement, pour le montant et pour le compte',
      why: 'C’est le moment où une erreur est encore petite et encore facile à corriger par vous-même.',
    },
    dd_foreign_start: {
      text: 'Commencez par l’ayuntamiento si vous utilisez un IBAN étranger',
      why: 'Les guichets municipaux et les concessionnaires de l’eau sont les endroits où un IBAN non espagnol risque le plus d’être refusé ou mal saisi. Si cela doit échouer, c’est là, et vous voulez le savoir avant que quatre autres fournisseurs en dépendent.',
    },
    on_cycle: {
      text: 'Les factures arrivent au rythme du fournisseur, pas au vôtre',
      why: 'Tous les mois, tous les deux mois ou tous les trimestres, selon votre fournisseur et l’emplacement du bien. Notez lequel, pour qu’une facture qui n’arrive pas soit quelque chose que vous remarquez et non quelque chose que vous découvrez.',
    },
    on_standing: {
      text: 'Un abonnement court, qu’il y ait quelqu’un dans le bien ou non',
      why: 'L’électricité comme l’eau facturent le simple fait d’être raccordé. Une résidence secondaire vide a un plancher de factures, et la puissance souscrite est en général le seul vrai levier pour le baisser.',
    },
    on_gas_inspection: {
      text: 'L’installation de gaz doit être contrôlée périodiquement, à vos frais, en présence de quelqu’un',
      why: 'Ce n’est pas facultatif et cela exige un accès, ce qui pour un propriétaire à l’étranger veut dire planifier plutôt que réagir.',
    },
    on_estimates: {
      text: 'Les relevés sont estimés quand personne ne peut accéder au compteur',
      why: 'Les estimations finissent par être corrigées, et la régularisation n’est pas étalée. Elle arrive d’un seul coup.',
    },
    on_refuse: {
      text: 'La taxe d’ordures court tant que vous êtes propriétaire du bien',
      why: 'Elle est attachée au bien, et non au fait que quelqu’un l’utilise ou que les poubelles aient jamais été sorties.',
    },
    on_tariff: {
      text: 'Regardez le tarif une fois par an plutôt que jamais',
      why: 'Les tarifs se reconduisent sans bruit. Un examen annuel de l’abonnement et de la puissance souscrite est en général là où se trouve l’argent, plutôt que dans le prix du kilowattheure que tout le monde compare.',
    },
    on_community: {
      text: 'Les charges de copropriété s’ajoutent à tout cela, et elles ne s’arrêtent pas',
      why: 'En Espagne, les dettes de copropriété sont attachées au bien et non au propriétaire qui les a contractées, elles suivent donc la maison, y compris lors d’une vente.',
    },
  },
};
