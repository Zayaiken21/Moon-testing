/* =====================================================================
   VOXELIA · LANGUAGES
   ---------------------------------------------------------------------
   The game in whatever language the device is set to, with no setting to
   find and nothing to press.

   HOW IT WORKS, AND WHY IT IS BUILT THIS WAY

   There are no keys in the markup. Nothing says data-i18n="home.play".
   The English text IS the key: the page is walked, and any piece of text
   that appears in a table below is swapped for its translation. Two
   reasons for that choice, and both of them matter here:

     - index.html is one enormous file. Threading several hundred key
       attributes through it is several hundred chances to put one in the
       wrong place, and every one of them would have to be kept in step
       with the English for ever afterwards.
     - Anything NOT in a table is left exactly as it is. A missing
       translation is the English word, in place, still readable — never a
       blank, and never a raw key like "home.play" showing through.

   The screens are built and rebuilt constantly by UI, so a single pass at
   startup would only catch what happened to exist at that moment. A
   MutationObserver watches for new text and translates that too, which is
   what makes the bag, the crafting list and every toast come out in the
   right language without any of that code knowing this file exists.

   WHAT IS AND IS NOT COVERED

   The engine handles any language. The tables below cover the interface —
   the screens, the buttons, the labels, the words a player reads to find
   their way around — in twelve languages. Block and item names are still
   English on purpose: there are over two hundred of them, they are the
   game's own vocabulary, and a half-finished job on those would be worse
   than leaving them alone. Adding a language is adding one object to
   DICT. Adding a string is adding one line to each.

   Right-to-left languages get the whole page flipped, not just the words.
   ===================================================================== */
(function () {
  'use strict';

  /* Which languages read right to left. The page direction has to change,
     not only the words, or Arabic comes out reading off the wrong edge. */
  const RTL = ['ar', 'he', 'fa', 'ur', 'ps', 'sd', 'yi'];

  /* ---------------------------------------------------------------
     The tables. Keyed by the English, exactly as it appears on screen.
     --------------------------------------------------------------- */
  const DICT = {
    es: {
      'build · tame · wander': 'construye · doma · explora',
      'A blocky open world where': 'Un mundo abierto de bloques donde',
      'nothing can be killed': 'nada puede morir',
      'World seed': 'Semilla del mundo', 'New seed': 'Nueva semilla',
      'How you want to play': 'Cómo quieres jugar',
      'Survival': 'Supervivencia', 'Creative': 'Creativo',
      'Gather every block. Stamina, breath, real effort.':
        'Reúne cada bloque. Energía, aliento, esfuerzo de verdad.',
      'Fly freely. Every block, unlimited.': 'Vuela libre. Todos los bloques, sin límite.',
      'Enter the world': 'Entrar al mundo', 'Character': 'Personaje',
      'Settings': 'Ajustes', 'How to play': 'Cómo jugar',
      'Multiplayer': 'Multijugador', 'Load a world': 'Cargar un mundo',
      'Stamina': 'Energía', 'Breath': 'Aliento', 'level': 'nivel',
      'Send': 'Enviar', 'Cancel': 'Cancelar', 'Bag': 'Bolsa', 'Drop': 'Soltar',
      'Fly': 'Volar', 'Lamp': 'Lámpara', 'Use': 'Usar', 'Place': 'Colocar',
      'Mine': 'Picar', 'Jump': 'Saltar', 'Picture': 'Imagen',
      'Female': 'Mujer', 'Male': 'Hombre', 'Chosen': 'Elegido',
      'Your name': 'Tu nombre', 'Sign in': 'Iniciar sesión', 'Not now': 'Ahora no',
      'Spawn in': 'Aparecer', 'Player 2': 'Jugador 2',
      'Star chart': 'Carta estelar', 'Land here': 'Aterrizar aquí',
      'Aboard the ship': 'A bordo de la nave', 'Step out on tether': 'Salir con el cable',
      'Give': 'Dar', 'Stay here': 'Quedarme', 'Go to them': 'Ir con ellos',
      'No thanks': 'No, gracias', 'Take it in': 'Recogerlo',
      'View distance': 'Distancia de visión', 'Field of view': 'Campo de visión',
      'Look sensitivity': 'Sensibilidad de la vista', 'Invert look': 'Invertir la vista',
      'Show frame rate': 'Mostrar fotogramas', 'Split screen': 'Pantalla dividida',
      'Looking and moving': 'Mirar y moverse', 'Language': 'Idioma',
      'Automatic': 'Automático', 'Sound effects': 'Efectos de sonido',
      'Music': 'Música', 'Close': 'Cerrar', 'Back': 'Atrás', 'Done': 'Listo',
      'Reset': 'Restablecer', 'Save': 'Guardar', 'Delete': 'Eliminar',
      'Yes': 'Sí', 'No': 'No', 'Host a game': 'Crear partida', 'Join': 'Unirse',
      'Wallet': 'Cartera', 'Store': 'Tienda', 'Map': 'Mapa'
    },
    pt: {
      'build · tame · wander': 'construir · domar · explorar',
      'A blocky open world where': 'Um mundo aberto de blocos onde',
      'nothing can be killed': 'nada pode ser morto',
      'World seed': 'Semente do mundo', 'New seed': 'Nova semente',
      'How you want to play': 'Como você quer jogar',
      'Survival': 'Sobrevivência', 'Creative': 'Criativo',
      'Gather every block. Stamina, breath, real effort.':
        'Colete cada bloco. Energia, fôlego, esforço de verdade.',
      'Fly freely. Every block, unlimited.': 'Voe livre. Todos os blocos, sem limite.',
      'Enter the world': 'Entrar no mundo', 'Character': 'Personagem',
      'Settings': 'Configurações', 'How to play': 'Como jogar',
      'Multiplayer': 'Multijogador', 'Load a world': 'Carregar um mundo',
      'Stamina': 'Energia', 'Breath': 'Fôlego', 'level': 'nível',
      'Send': 'Enviar', 'Cancel': 'Cancelar', 'Bag': 'Mochila', 'Drop': 'Soltar',
      'Fly': 'Voar', 'Lamp': 'Lanterna', 'Use': 'Usar', 'Place': 'Colocar',
      'Mine': 'Minerar', 'Jump': 'Pular', 'Picture': 'Imagem',
      'Female': 'Feminino', 'Male': 'Masculino', 'Chosen': 'Escolhido',
      'Your name': 'Seu nome', 'Sign in': 'Entrar', 'Not now': 'Agora não',
      'Spawn in': 'Entrar no jogo', 'Player 2': 'Jogador 2',
      'Star chart': 'Carta estelar', 'Land here': 'Pousar aqui',
      'Aboard the ship': 'A bordo da nave', 'Step out on tether': 'Sair na corda',
      'Give': 'Dar', 'Stay here': 'Ficar aqui', 'Go to them': 'Ir até eles',
      'No thanks': 'Não, obrigado', 'Take it in': 'Recolher',
      'View distance': 'Distância de visão', 'Field of view': 'Campo de visão',
      'Look sensitivity': 'Sensibilidade da mira', 'Invert look': 'Inverter a mira',
      'Show frame rate': 'Mostrar taxa de quadros', 'Split screen': 'Tela dividida',
      'Looking and moving': 'Olhar e mover', 'Language': 'Idioma',
      'Automatic': 'Automático', 'Sound effects': 'Efeitos sonoros',
      'Music': 'Música', 'Close': 'Fechar', 'Back': 'Voltar', 'Done': 'Pronto',
      'Reset': 'Redefinir', 'Save': 'Salvar', 'Delete': 'Excluir',
      'Yes': 'Sim', 'No': 'Não', 'Host a game': 'Criar partida', 'Join': 'Entrar',
      'Wallet': 'Carteira', 'Store': 'Loja', 'Map': 'Mapa'
    },
    fr: {
      'build · tame · wander': 'construire · apprivoiser · explorer',
      'A blocky open world where': 'Un monde ouvert en blocs où',
      'nothing can be killed': 'rien ne peut être tué',
      'World seed': 'Graine du monde', 'New seed': 'Nouvelle graine',
      'How you want to play': 'Comment veux-tu jouer',
      'Survival': 'Survie', 'Creative': 'Créatif',
      'Gather every block. Stamina, breath, real effort.':
        'Récolte chaque bloc. Endurance, souffle, vrai effort.',
      'Fly freely. Every block, unlimited.': 'Vole librement. Tous les blocs, sans limite.',
      'Enter the world': 'Entrer dans le monde', 'Character': 'Personnage',
      'Settings': 'Réglages', 'How to play': 'Comment jouer',
      'Multiplayer': 'Multijoueur', 'Load a world': 'Charger un monde',
      'Stamina': 'Endurance', 'Breath': 'Souffle', 'level': 'niveau',
      'Send': 'Envoyer', 'Cancel': 'Annuler', 'Bag': 'Sac', 'Drop': 'Lâcher',
      'Fly': 'Voler', 'Lamp': 'Lampe', 'Use': 'Utiliser', 'Place': 'Poser',
      'Mine': 'Miner', 'Jump': 'Sauter', 'Picture': 'Image',
      'Female': 'Femme', 'Male': 'Homme', 'Chosen': 'Choisi',
      'Your name': 'Ton nom', 'Sign in': 'Se connecter', 'Not now': 'Pas maintenant',
      'Spawn in': 'Rejoindre', 'Player 2': 'Joueur 2',
      'Star chart': 'Carte des étoiles', 'Land here': 'Atterrir ici',
      'Aboard the ship': 'À bord du vaisseau', 'Step out on tether': 'Sortir à la longe',
      'Give': 'Donner', 'Stay here': 'Rester ici', 'Go to them': 'Les rejoindre',
      'No thanks': 'Non merci', 'Take it in': 'Le prendre',
      'View distance': 'Distance de vue', 'Field of view': 'Champ de vision',
      'Look sensitivity': 'Sensibilité de la vue', 'Invert look': 'Inverser la vue',
      'Show frame rate': 'Afficher les images par seconde', 'Split screen': 'Écran partagé',
      'Looking and moving': 'Regarder et se déplacer', 'Language': 'Langue',
      'Automatic': 'Automatique', 'Sound effects': 'Effets sonores',
      'Music': 'Musique', 'Close': 'Fermer', 'Back': 'Retour', 'Done': 'Terminé',
      'Reset': 'Réinitialiser', 'Save': 'Enregistrer', 'Delete': 'Supprimer',
      'Yes': 'Oui', 'No': 'Non', 'Host a game': 'Créer une partie', 'Join': 'Rejoindre',
      'Wallet': 'Porte-monnaie', 'Store': 'Boutique', 'Map': 'Carte'
    },
    de: {
      'build · tame · wander': 'bauen · zähmen · wandern',
      'A blocky open world where': 'Eine offene Klötzchenwelt, in der',
      'nothing can be killed': 'nichts getötet werden kann',
      'World seed': 'Welt-Startwert', 'New seed': 'Neuer Startwert',
      'How you want to play': 'Wie möchtest du spielen',
      'Survival': 'Überleben', 'Creative': 'Kreativ',
      'Gather every block. Stamina, breath, real effort.':
        'Sammle jeden Block. Ausdauer, Atem, echte Mühe.',
      'Fly freely. Every block, unlimited.': 'Flieg frei. Jeder Block, unbegrenzt.',
      'Enter the world': 'Welt betreten', 'Character': 'Figur',
      'Settings': 'Einstellungen', 'How to play': 'Spielanleitung',
      'Multiplayer': 'Mehrspieler', 'Load a world': 'Welt laden',
      'Stamina': 'Ausdauer', 'Breath': 'Atem', 'level': 'Stufe',
      'Send': 'Senden', 'Cancel': 'Abbrechen', 'Bag': 'Tasche', 'Drop': 'Fallen lassen',
      'Fly': 'Fliegen', 'Lamp': 'Lampe', 'Use': 'Benutzen', 'Place': 'Setzen',
      'Mine': 'Abbauen', 'Jump': 'Springen', 'Picture': 'Bild',
      'Female': 'Weiblich', 'Male': 'Männlich', 'Chosen': 'Gewählt',
      'Your name': 'Dein Name', 'Sign in': 'Anmelden', 'Not now': 'Jetzt nicht',
      'Spawn in': 'Einsteigen', 'Player 2': 'Spieler 2',
      'Star chart': 'Sternkarte', 'Land here': 'Hier landen',
      'Aboard the ship': 'An Bord', 'Step out on tether': 'An der Leine aussteigen',
      'Give': 'Geben', 'Stay here': 'Hierbleiben', 'Go to them': 'Zu ihnen gehen',
      'No thanks': 'Nein danke', 'Take it in': 'Aufnehmen',
      'View distance': 'Sichtweite', 'Field of view': 'Sichtfeld',
      'Look sensitivity': 'Blickempfindlichkeit', 'Invert look': 'Blick umkehren',
      'Show frame rate': 'Bildrate anzeigen', 'Split screen': 'Geteilter Bildschirm',
      'Looking and moving': 'Schauen und Bewegen', 'Language': 'Sprache',
      'Automatic': 'Automatisch', 'Sound effects': 'Geräusche',
      'Music': 'Musik', 'Close': 'Schließen', 'Back': 'Zurück', 'Done': 'Fertig',
      'Reset': 'Zurücksetzen', 'Save': 'Speichern', 'Delete': 'Löschen',
      'Yes': 'Ja', 'No': 'Nein', 'Host a game': 'Spiel eröffnen', 'Join': 'Beitreten',
      'Wallet': 'Geldbeutel', 'Store': 'Laden', 'Map': 'Karte'
    },
    it: {
      'build · tame · wander': 'costruisci · addomestica · esplora',
      'A blocky open world where': 'Un mondo aperto di blocchi dove',
      'nothing can be killed': 'nulla può essere ucciso',
      'World seed': 'Seme del mondo', 'New seed': 'Nuovo seme',
      'How you want to play': 'Come vuoi giocare',
      'Survival': 'Sopravvivenza', 'Creative': 'Creativo',
      'Gather every block. Stamina, breath, real effort.':
        'Raccogli ogni blocco. Energia, fiato, fatica vera.',
      'Fly freely. Every block, unlimited.': 'Vola libero. Ogni blocco, senza limiti.',
      'Enter the world': 'Entra nel mondo', 'Character': 'Personaggio',
      'Settings': 'Impostazioni', 'How to play': 'Come si gioca',
      'Multiplayer': 'Multigiocatore', 'Load a world': 'Carica un mondo',
      'Stamina': 'Energia', 'Breath': 'Fiato', 'level': 'livello',
      'Send': 'Invia', 'Cancel': 'Annulla', 'Bag': 'Zaino', 'Drop': 'Lascia',
      'Fly': 'Vola', 'Lamp': 'Lampada', 'Use': 'Usa', 'Place': 'Posiziona',
      'Mine': 'Scava', 'Jump': 'Salta', 'Picture': 'Immagine',
      'Female': 'Femmina', 'Male': 'Maschio', 'Chosen': 'Scelto',
      'Your name': 'Il tuo nome', 'Sign in': 'Accedi', 'Not now': 'Non ora',
      'Spawn in': 'Entra', 'Player 2': 'Giocatore 2',
      'Star chart': 'Mappa stellare', 'Land here': 'Atterra qui',
      'Aboard the ship': 'A bordo', 'Step out on tether': 'Esci con il cavo',
      'Give': 'Dai', 'Stay here': 'Resta qui', 'Go to them': 'Vai da loro',
      'No thanks': 'No grazie', 'Take it in': 'Raccogli',
      'View distance': 'Distanza visiva', 'Field of view': 'Campo visivo',
      'Look sensitivity': 'Sensibilità della vista', 'Invert look': 'Inverti la vista',
      'Show frame rate': 'Mostra i fotogrammi', 'Split screen': 'Schermo diviso',
      'Looking and moving': 'Guardare e muoversi', 'Language': 'Lingua',
      'Automatic': 'Automatico', 'Sound effects': 'Effetti sonori',
      'Music': 'Musica', 'Close': 'Chiudi', 'Back': 'Indietro', 'Done': 'Fatto',
      'Reset': 'Ripristina', 'Save': 'Salva', 'Delete': 'Elimina',
      'Yes': 'Sì', 'No': 'No', 'Host a game': 'Crea una partita', 'Join': 'Unisciti',
      'Wallet': 'Portafoglio', 'Store': 'Negozio', 'Map': 'Mappa'
    },
    ru: {
      'build · tame · wander': 'строй · приручай · странствуй',
      'A blocky open world where': 'Открытый мир из блоков, где',
      'nothing can be killed': 'никого нельзя убить',
      'World seed': 'Зерно мира', 'New seed': 'Новое зерно',
      'How you want to play': 'Как ты хочешь играть',
      'Survival': 'Выживание', 'Creative': 'Творческий',
      'Gather every block. Stamina, breath, real effort.':
        'Собирай каждый блок. Выносливость, дыхание, настоящий труд.',
      'Fly freely. Every block, unlimited.': 'Летай свободно. Все блоки, без ограничений.',
      'Enter the world': 'Войти в мир', 'Character': 'Персонаж',
      'Settings': 'Настройки', 'How to play': 'Как играть',
      'Multiplayer': 'Сетевая игра', 'Load a world': 'Загрузить мир',
      'Stamina': 'Выносливость', 'Breath': 'Дыхание', 'level': 'уровень',
      'Send': 'Отправить', 'Cancel': 'Отмена', 'Bag': 'Сумка', 'Drop': 'Бросить',
      'Fly': 'Лететь', 'Lamp': 'Лампа', 'Use': 'Использовать', 'Place': 'Поставить',
      'Mine': 'Копать', 'Jump': 'Прыжок', 'Picture': 'Изображение',
      'Female': 'Женский', 'Male': 'Мужской', 'Chosen': 'Выбрано',
      'Your name': 'Твоё имя', 'Sign in': 'Войти', 'Not now': 'Не сейчас',
      'Spawn in': 'Появиться', 'Player 2': 'Игрок 2',
      'Star chart': 'Звёздная карта', 'Land here': 'Сесть здесь',
      'Aboard the ship': 'На борту', 'Step out on tether': 'Выйти на тросе',
      'Give': 'Дать', 'Stay here': 'Остаться', 'Go to them': 'Пойти к ним',
      'No thanks': 'Нет, спасибо', 'Take it in': 'Забрать',
      'View distance': 'Дальность обзора', 'Field of view': 'Поле зрения',
      'Look sensitivity': 'Чувствительность обзора', 'Invert look': 'Инвертировать обзор',
      'Show frame rate': 'Показывать кадры в секунду', 'Split screen': 'Разделённый экран',
      'Looking and moving': 'Обзор и движение', 'Language': 'Язык',
      'Automatic': 'Автоматически', 'Sound effects': 'Звуки',
      'Music': 'Музыка', 'Close': 'Закрыть', 'Back': 'Назад', 'Done': 'Готово',
      'Reset': 'Сбросить', 'Save': 'Сохранить', 'Delete': 'Удалить',
      'Yes': 'Да', 'No': 'Нет', 'Host a game': 'Создать игру', 'Join': 'Присоединиться',
      'Wallet': 'Кошелёк', 'Store': 'Магазин', 'Map': 'Карта'
    },
    ar: {
      'build · tame · wander': 'ابنِ · روّض · تجوّل',
      'A blocky open world where': 'عالم مفتوح من المكعبات حيث',
      'nothing can be killed': 'لا يمكن قتل أي شيء',
      'World seed': 'بذرة العالم', 'New seed': 'بذرة جديدة',
      'How you want to play': 'كيف تريد أن تلعب',
      'Survival': 'البقاء', 'Creative': 'الإبداع',
      'Gather every block. Stamina, breath, real effort.':
        'اجمع كل مكعب. طاقة، نفَس، جهد حقيقي.',
      'Fly freely. Every block, unlimited.': 'حلّق بحرية. كل المكعبات، بلا حدود.',
      'Enter the world': 'ادخل العالم', 'Character': 'الشخصية',
      'Settings': 'الإعدادات', 'How to play': 'كيف تلعب',
      'Multiplayer': 'لعب جماعي', 'Load a world': 'تحميل عالم',
      'Stamina': 'الطاقة', 'Breath': 'النفَس', 'level': 'المستوى',
      'Send': 'إرسال', 'Cancel': 'إلغاء', 'Bag': 'الحقيبة', 'Drop': 'إسقاط',
      'Fly': 'طيران', 'Lamp': 'مصباح', 'Use': 'استخدام', 'Place': 'وضع',
      'Mine': 'تعدين', 'Jump': 'قفز', 'Picture': 'صورة',
      'Female': 'أنثى', 'Male': 'ذكر', 'Chosen': 'المختار',
      'Your name': 'اسمك', 'Sign in': 'تسجيل الدخول', 'Not now': 'ليس الآن',
      'Spawn in': 'الدخول', 'Player 2': 'اللاعب 2',
      'Star chart': 'خريطة النجوم', 'Land here': 'الهبوط هنا',
      'Aboard the ship': 'على متن السفينة', 'Step out on tether': 'الخروج بالحبل',
      'Give': 'إعطاء', 'Stay here': 'البقاء هنا', 'Go to them': 'الذهاب إليهم',
      'No thanks': 'لا شكرًا', 'Take it in': 'أخذه',
      'View distance': 'مدى الرؤية', 'Field of view': 'مجال الرؤية',
      'Look sensitivity': 'حساسية النظر', 'Invert look': 'عكس النظر',
      'Show frame rate': 'إظهار معدل الإطارات', 'Split screen': 'شاشة مقسومة',
      'Looking and moving': 'النظر والحركة', 'Language': 'اللغة',
      'Automatic': 'تلقائي', 'Sound effects': 'المؤثرات الصوتية',
      'Music': 'الموسيقى', 'Close': 'إغلاق', 'Back': 'رجوع', 'Done': 'تم',
      'Reset': 'إعادة تعيين', 'Save': 'حفظ', 'Delete': 'حذف',
      'Yes': 'نعم', 'No': 'لا', 'Host a game': 'إنشاء لعبة', 'Join': 'انضمام',
      'Wallet': 'المحفظة', 'Store': 'المتجر', 'Map': 'الخريطة'
    },
    hi: {
      'build · tame · wander': 'बनाओ · पालो · घूमो',
      'A blocky open world where': 'ब्लॉकों की खुली दुनिया जहाँ',
      'nothing can be killed': 'किसी को मारा नहीं जा सकता',
      'World seed': 'दुनिया का बीज', 'New seed': 'नया बीज',
      'How you want to play': 'आप कैसे खेलना चाहते हैं',
      'Survival': 'सरवाइवल', 'Creative': 'क्रिएटिव',
      'Gather every block. Stamina, breath, real effort.':
        'हर ब्लॉक जुटाओ। दमखम, साँस, असली मेहनत।',
      'Fly freely. Every block, unlimited.': 'आज़ादी से उड़ो। हर ब्लॉक, बिना सीमा।',
      'Enter the world': 'दुनिया में जाएँ', 'Character': 'किरदार',
      'Settings': 'सेटिंग्स', 'How to play': 'कैसे खेलें',
      'Multiplayer': 'मल्टीप्लेयर', 'Load a world': 'दुनिया लोड करें',
      'Stamina': 'दमखम', 'Breath': 'साँस', 'level': 'स्तर',
      'Send': 'भेजें', 'Cancel': 'रद्द करें', 'Bag': 'थैला', 'Drop': 'गिराएँ',
      'Fly': 'उड़ें', 'Lamp': 'दीप', 'Use': 'इस्तेमाल', 'Place': 'रखें',
      'Mine': 'खोदें', 'Jump': 'कूदें', 'Picture': 'तस्वीर',
      'Female': 'महिला', 'Male': 'पुरुष', 'Chosen': 'चुना गया',
      'Your name': 'आपका नाम', 'Sign in': 'साइन इन', 'Not now': 'अभी नहीं',
      'Spawn in': 'शामिल हों', 'Player 2': 'खिलाड़ी 2',
      'Star chart': 'तारा नक्शा', 'Land here': 'यहाँ उतरें',
      'Aboard the ship': 'जहाज़ पर', 'Step out on tether': 'रस्सी पर बाहर जाएँ',
      'Give': 'दें', 'Stay here': 'यहीं रहें', 'Go to them': 'उनके पास जाएँ',
      'No thanks': 'नहीं, धन्यवाद', 'Take it in': 'ले लें',
      'View distance': 'दृश्य दूरी', 'Field of view': 'दृष्टि क्षेत्र',
      'Look sensitivity': 'नज़र संवेदनशीलता', 'Invert look': 'नज़र उलटें',
      'Show frame rate': 'फ्रेम दर दिखाएँ', 'Split screen': 'बँटी स्क्रीन',
      'Looking and moving': 'देखना और चलना', 'Language': 'भाषा',
      'Automatic': 'स्वचालित', 'Sound effects': 'ध्वनि प्रभाव',
      'Music': 'संगीत', 'Close': 'बंद करें', 'Back': 'वापस', 'Done': 'हो गया',
      'Reset': 'रीसेट', 'Save': 'सहेजें', 'Delete': 'हटाएँ',
      'Yes': 'हाँ', 'No': 'नहीं', 'Host a game': 'गेम बनाएँ', 'Join': 'जुड़ें',
      'Wallet': 'बटुआ', 'Store': 'दुकान', 'Map': 'नक्शा'
    },
    ja: {
      'build · tame · wander': 'つくる · なつかせる · さまよう',
      'A blocky open world where': 'ブロックでできた世界。ここでは',
      'nothing can be killed': 'だれも傷つけられない',
      'World seed': 'ワールドシード', 'New seed': '新しいシード',
      'How you want to play': 'あそびかたをえらぶ',
      'Survival': 'サバイバル', 'Creative': 'クリエイティブ',
      'Gather every block. Stamina, breath, real effort.':
        'ブロックをあつめよう。体力も息も、ほんものの手ごたえ。',
      'Fly freely. Every block, unlimited.': '自由に飛べる。ブロックは使いほうだい。',
      'Enter the world': 'せかいへ', 'Character': 'キャラクター',
      'Settings': '設定', 'How to play': 'あそびかた',
      'Multiplayer': 'マルチプレイ', 'Load a world': 'ワールドをひらく',
      'Stamina': '体力', 'Breath': '息', 'level': 'レベル',
      'Send': '送る', 'Cancel': 'やめる', 'Bag': 'かばん', 'Drop': 'すてる',
      'Fly': 'とぶ', 'Lamp': 'ランプ', 'Use': 'つかう', 'Place': 'おく',
      'Mine': 'ほる', 'Jump': 'ジャンプ', 'Picture': 'がぞう',
      'Female': '女の子', 'Male': '男の子', 'Chosen': 'えらんだもの',
      'Your name': 'なまえ', 'Sign in': 'サインイン', 'Not now': 'あとで',
      'Spawn in': 'さんかする', 'Player 2': 'プレイヤー2',
      'Star chart': '星図', 'Land here': 'ここに着陸',
      'Aboard the ship': '船のなか', 'Step out on tether': 'ロープで外へ',
      'Give': 'わたす', 'Stay here': 'ここにいる', 'Go to them': 'あいてのところへ',
      'No thanks': 'やめておく', 'Take it in': 'うけとる',
      'View distance': '描画きょり', 'Field of view': '視野',
      'Look sensitivity': '視点の感度', 'Invert look': '視点を反転',
      'Show frame rate': 'フレームレートを表示', 'Split screen': '画面分割',
      'Looking and moving': '視点と移動', 'Language': '言語',
      'Automatic': '自動', 'Sound effects': '効果音',
      'Music': '音楽', 'Close': 'とじる', 'Back': 'もどる', 'Done': 'かんりょう',
      'Reset': 'リセット', 'Save': 'ほぞん', 'Delete': 'さくじょ',
      'Yes': 'はい', 'No': 'いいえ', 'Host a game': 'ルームをつくる', 'Join': 'さんか',
      'Wallet': 'さいふ', 'Store': 'ショップ', 'Map': 'マップ'
    },
    ko: {
      'build · tame · wander': '짓고 · 길들이고 · 거닐다',
      'A blocky open world where': '블록으로 된 열린 세계,',
      'nothing can be killed': '아무것도 죽일 수 없는 곳',
      'World seed': '월드 시드', 'New seed': '새 시드',
      'How you want to play': '어떻게 놀고 싶나요',
      'Survival': '생존', 'Creative': '창작',
      'Gather every block. Stamina, breath, real effort.':
        '블록을 모으세요. 체력도 숨도, 진짜 노력.',
      'Fly freely. Every block, unlimited.': '자유롭게 날기. 모든 블록, 무제한.',
      'Enter the world': '세계로 들어가기', 'Character': '캐릭터',
      'Settings': '설정', 'How to play': '플레이 방법',
      'Multiplayer': '멀티플레이', 'Load a world': '월드 불러오기',
      'Stamina': '체력', 'Breath': '호흡', 'level': '레벨',
      'Send': '보내기', 'Cancel': '취소', 'Bag': '가방', 'Drop': '버리기',
      'Fly': '비행', 'Lamp': '램프', 'Use': '사용', 'Place': '설치',
      'Mine': '캐기', 'Jump': '점프', 'Picture': '사진',
      'Female': '여성', 'Male': '남성', 'Chosen': '선택됨',
      'Your name': '이름', 'Sign in': '로그인', 'Not now': '나중에',
      'Spawn in': '참가하기', 'Player 2': '플레이어 2',
      'Star chart': '성도', 'Land here': '여기 착륙',
      'Aboard the ship': '우주선 안', 'Step out on tether': '줄을 잡고 나가기',
      'Give': '주기', 'Stay here': '여기 있기', 'Go to them': '그쪽으로 가기',
      'No thanks': '괜찮아요', 'Take it in': '받기',
      'View distance': '시야 거리', 'Field of view': '시야각',
      'Look sensitivity': '시점 감도', 'Invert look': '시점 반전',
      'Show frame rate': '프레임 표시', 'Split screen': '화면 분할',
      'Looking and moving': '시점과 이동', 'Language': '언어',
      'Automatic': '자동', 'Sound effects': '효과음',
      'Music': '음악', 'Close': '닫기', 'Back': '뒤로', 'Done': '완료',
      'Reset': '초기화', 'Save': '저장', 'Delete': '삭제',
      'Yes': '예', 'No': '아니요', 'Host a game': '방 만들기', 'Join': '참가',
      'Wallet': '지갑', 'Store': '상점', 'Map': '지도'
    },
    zh: {
      'build · tame · wander': '建造 · 驯服 · 漫游',
      'A blocky open world where': '一个方块开放世界，在这里',
      'nothing can be killed': '没有任何东西会被杀死',
      'World seed': '世界种子', 'New seed': '新种子',
      'How you want to play': '你想怎么玩',
      'Survival': '生存', 'Creative': '创造',
      'Gather every block. Stamina, breath, real effort.':
        '收集每一个方块。体力、呼吸，实打实的努力。',
      'Fly freely. Every block, unlimited.': '自由飞行。所有方块，无限使用。',
      'Enter the world': '进入世界', 'Character': '角色',
      'Settings': '设置', 'How to play': '玩法说明',
      'Multiplayer': '多人游戏', 'Load a world': '载入世界',
      'Stamina': '体力', 'Breath': '呼吸', 'level': '等级',
      'Send': '发送', 'Cancel': '取消', 'Bag': '背包', 'Drop': '丢弃',
      'Fly': '飞行', 'Lamp': '灯', 'Use': '使用', 'Place': '放置',
      'Mine': '挖掘', 'Jump': '跳跃', 'Picture': '图片',
      'Female': '女', 'Male': '男', 'Chosen': '已选择',
      'Your name': '你的名字', 'Sign in': '登录', 'Not now': '暂不',
      'Spawn in': '加入', 'Player 2': '玩家 2',
      'Star chart': '星图', 'Land here': '在此降落',
      'Aboard the ship': '在飞船上', 'Step out on tether': '系绳出舱',
      'Give': '给予', 'Stay here': '留在这里', 'Go to them': '去找他们',
      'No thanks': '不用了', 'Take it in': '收下',
      'View distance': '视野距离', 'Field of view': '视场角',
      'Look sensitivity': '视角灵敏度', 'Invert look': '反转视角',
      'Show frame rate': '显示帧率', 'Split screen': '分屏',
      'Looking and moving': '视角与移动', 'Language': '语言',
      'Automatic': '自动', 'Sound effects': '音效',
      'Music': '音乐', 'Close': '关闭', 'Back': '返回', 'Done': '完成',
      'Reset': '重置', 'Save': '保存', 'Delete': '删除',
      'Yes': '是', 'No': '否', 'Host a game': '创建房间', 'Join': '加入',
      'Wallet': '钱包', 'Store': '商店', 'Map': '地图'
    },
    id: {
      'build · tame · wander': 'bangun · jinakkan · jelajah',
      'A blocky open world where': 'Dunia terbuka penuh balok di mana',
      'nothing can be killed': 'tidak ada yang bisa dibunuh',
      'World seed': 'Benih dunia', 'New seed': 'Benih baru',
      'How you want to play': 'Kamu mau main bagaimana',
      'Survival': 'Bertahan hidup', 'Creative': 'Kreatif',
      'Gather every block. Stamina, breath, real effort.':
        'Kumpulkan setiap balok. Stamina, napas, usaha sungguhan.',
      'Fly freely. Every block, unlimited.': 'Terbang bebas. Semua balok, tanpa batas.',
      'Enter the world': 'Masuk ke dunia', 'Character': 'Karakter',
      'Settings': 'Pengaturan', 'How to play': 'Cara bermain',
      'Multiplayer': 'Multipemain', 'Load a world': 'Muat dunia',
      'Stamina': 'Stamina', 'Breath': 'Napas', 'level': 'tingkat',
      'Send': 'Kirim', 'Cancel': 'Batal', 'Bag': 'Tas', 'Drop': 'Jatuhkan',
      'Fly': 'Terbang', 'Lamp': 'Lampu', 'Use': 'Pakai', 'Place': 'Pasang',
      'Mine': 'Gali', 'Jump': 'Lompat', 'Picture': 'Gambar',
      'Female': 'Perempuan', 'Male': 'Laki-laki', 'Chosen': 'Dipilih',
      'Your name': 'Namamu', 'Sign in': 'Masuk', 'Not now': 'Nanti saja',
      'Spawn in': 'Gabung', 'Player 2': 'Pemain 2',
      'Star chart': 'Peta bintang', 'Land here': 'Mendarat di sini',
      'Aboard the ship': 'Di dalam kapal', 'Step out on tether': 'Keluar dengan tali',
      'Give': 'Beri', 'Stay here': 'Tetap di sini', 'Go to them': 'Pergi ke mereka',
      'No thanks': 'Tidak, terima kasih', 'Take it in': 'Ambil',
      'View distance': 'Jarak pandang', 'Field of view': 'Sudut pandang',
      'Look sensitivity': 'Sensitivitas pandangan', 'Invert look': 'Balik pandangan',
      'Show frame rate': 'Tampilkan frame rate', 'Split screen': 'Layar terbagi',
      'Looking and moving': 'Melihat dan bergerak', 'Language': 'Bahasa',
      'Automatic': 'Otomatis', 'Sound effects': 'Efek suara',
      'Music': 'Musik', 'Close': 'Tutup', 'Back': 'Kembali', 'Done': 'Selesai',
      'Reset': 'Atur ulang', 'Save': 'Simpan', 'Delete': 'Hapus',
      'Yes': 'Ya', 'No': 'Tidak', 'Host a game': 'Buat permainan', 'Join': 'Gabung',
      'Wallet': 'Dompet', 'Store': 'Toko', 'Map': 'Peta'
    }
  };

  /* Every language the game can be read in, for the picker. */
  const NAMES = {
    en: 'English', es: 'Español', pt: 'Português', fr: 'Français', de: 'Deutsch',
    it: 'Italiano', ru: 'Русский', ar: 'العربية', hi: 'हिन्दी', ja: '日本語',
    ko: '한국어', zh: '中文', id: 'Bahasa Indonesia'
  };

  const KEY = 'voxelia.lang';

  /* ---------------------------------------------------------------
     Picking a language
     --------------------------------------------------------------- */
  function wanted() {
    let saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    if (saved && saved !== 'auto') return saved;
    /* navigator.languages is the ordered list the person actually set, so
       somebody whose phone is Portuguese first and English second gets
       Portuguese. navigator.language alone would only ever see one. */
    const list = (navigator.languages && navigator.languages.length)
      ? navigator.languages : [navigator.language || 'en'];
    for (const tag of list) {
      const base = String(tag).toLowerCase().split('-')[0];
      if (DICT[base]) return base;
      if (base === 'en') return 'en';
    }
    return 'en';
  }

  const L = {
    lang: 'en',
    table: null,

    /** One string, translated if we have it, and English if we do not. */
    t(s) {
      if (!this.table || typeof s !== 'string') return s;
      const hit = this.table[s.trim()];
      return hit === undefined ? s : hit;
    },

    /* Text that is only spacing, punctuation or numbers is never looked up:
       there is nothing to translate and a table would have to carry every
       number in the game. */
    skip(s) { return !s || !/[A-Za-zÀ-ɏ]{2}/.test(s); },

    /** Translate everything under one element, and its attributes. */
    walk(root) {
      if (!this.table || !root) return;
      const doc = root.ownerDocument || document;
      const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) => {
          const p = n.parentNode;
          if (!p) return NodeFilter.FILTER_REJECT;
          const tag = p.nodeName;
          /* never inside code, never inside a field somebody is typing in,
             and never anything marked as the game's own data */
          if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA')
            return NodeFilter.FILTER_REJECT;
          if (p.closest && p.closest('[data-no-translate]'))
            return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      });
      const jobs = [];
      let n;
      while ((n = walker.nextNode())) {
        const raw = n.nodeValue;
        if (this.skip(raw)) continue;
        const trimmed = raw.trim();
        const hit = this.table[trimmed];
        if (hit === undefined || hit === trimmed) continue;
        jobs.push([n, raw.replace(trimmed, hit)]);
      }
      /* changed in one go, after the walk, so the observer below sees one
         batch rather than being woken for every word */
      for (const [node, text] of jobs) node.nodeValue = text;

      const els = root.querySelectorAll
        ? root.querySelectorAll('[placeholder],[title],[aria-label]') : [];
      for (const el of els) {
        for (const a of ['placeholder', 'title', 'aria-label']) {
          const v = el.getAttribute(a);
          if (!v || this.skip(v)) continue;
          const hit = this.table[v.trim()];
          if (hit !== undefined && hit !== v) el.setAttribute(a, hit);
        }
      }
    },

    /** Change language now, without a reload. */
    use(code) {
      const c = (code && code !== 'auto') ? code : wanted();
      this.lang = DICT[c] ? c : 'en';
      this.table = DICT[this.lang] || null;
      try { localStorage.setItem(KEY, code || 'auto'); } catch (e) {}
      const html = document.documentElement;
      html.setAttribute('lang', this.lang);
      html.setAttribute('dir', RTL.indexOf(this.lang) >= 0 ? 'rtl' : 'ltr');
      /* A language the tables do not have is not a failure: the page is
         already in English and stays that way. Switching BACK to English
         from another language does need the page rebuilt, though, because
         the English words have been painted over. */
      if (!this.table) { if (this.wasTranslated) location.reload(); return this.lang; }
      this.wasTranslated = true;
      this.walk(document.body);
      return this.lang;
    },

    /** The list for a picker, English first. */
    list() {
      return Object.keys(NAMES).map((c) => ({ code: c, name: NAMES[c] }));
    },

    start() {
      this.use(null);
      /* The screens are built and rebuilt by UI all the time, so anything
         that appears later is translated as it appears. Without this only
         the home screen would ever come out right. */
      if (!window.MutationObserver) return;
      let queued = null;
      const obs = new MutationObserver((records) => {
        if (!this.table) return;
        if (queued) return;                       // one pass per frame at most
        queued = requestAnimationFrame(() => {
          queued = null;
          for (const r of records) {
            for (const node of r.addedNodes) {
              if (node.nodeType === 1) this.walk(node);
              else if (node.nodeType === 3 && !this.skip(node.nodeValue)) {
                const hit = this.table[node.nodeValue.trim()];
                if (hit !== undefined) node.nodeValue = node.nodeValue.replace(node.nodeValue.trim(), hit);
              }
            }
          }
        });
      });
      obs.observe(document.body, { childList: true, subtree: true });
    }
  };

  window.VoxeliaLang = L;
  /* Start as soon as there is a body to work on. */
  if (document.body) L.start();
  else addEventListener('DOMContentLoaded', () => L.start());
})();
