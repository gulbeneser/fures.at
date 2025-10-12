# Günlük AI Blog Otomasyonu Kullanım Rehberi

Bu depo, her sabah 09:10 (Europe/Istanbul) saatinde çalışarak AI haberlerini toplayan ve Netlify’a dağıtım yapan otomatik bir iş akışı içerir. Aşağıdaki adımlar otomasyonun sorunsuz işlemesi için sizin tamamlamanız gerekenleri özetler.

## 1. Gereksinimler

- GitHub Actions tarafında `OPENAI_API_KEY` gizli anahtarı.
- (Opsiyonel) Netlify Build Hook URL’si – Netlify deposu zaten otomatik tetikleniyorsa zorunlu değildir.
- Python 3.11 (yerelde test etmek isterseniz).

## 2. Gerekli gizli anahtarları ekleyin

1. GitHub repo ayarlarına gidin: **Settings → Secrets and variables → Actions**.
2. **New repository secret** diyerek aşağıdaki anahtarı girin:
   - `OPENAI_API_KEY`: OpenAI API anahtarınız.
3. Netlify tarafında manuel webhook kullanmak isterseniz `NETLIFY_BUILD_HOOK` gizli anahtarını da aynı ekrandan tanımlayın ve workflow’daki ilgili adımı açın.

## 3. Netlify yapılandırması

- Depo Netlify ile zaten bağlıysa ekstra işlem yapmanıza gerek yok; Git push olduğunda otomatik dağıtım tetiklenir.
- Yeni bir site kuruyorsanız Netlify’da **Add new site → Import an existing project** adımlarını izleyin, bu depoyu seçin ve
  - Build komutu: Projenizin statik site üreticisine göre (`npm run build`, `hugo` vb.).
  - Publish dizini: Netlify’da kullanılan frameworke göre (`dist`, `public`, `_site` vb.).

## 4. Otomasyonu ilk kez denemek

1. Yerelde test etmek için bağımlılıkları yükleyin:
   ```bash
   pip install -r requirements.txt  # Eğer ayrı bir dosya yoksa `pip install feedparser requests`
   export OPENAI_API_KEY=...        # Yerel ortam değişkeni
   python scripts/fetch_and_write.py
   ```
2. Komut sonunda `content/posts/YYYY/MM/` altında yeni bir Markdown dosyası oluştuğunu doğrulayın.
3. Her şey yolundaysa değişiklikleri commitleyip GitHub’a pushlayın. GitHub Actions günlük zamanlanmış çalışmada aynı komutu tetikleyecektir.

## 5. GitHub Actions iş akışını izlemek

- GitHub’da **Actions → Daily AI Blog** akışına giderek logları inceleyin.
- Haber sayısı yetersizse iş akışı “Not enough entries today” mesajıyla sonlanır. Bu durumda manuel bir işlem gerekmez.

## 6. Bakım önerileri

- `scripts/feeds.yml` dosyasındaki kaynakları periyodik olarak güncelleyin.
- Çok fazla benzer haber gelirse `MAX_ITEMS` veya `MIN_UNIQUE_SOURCES` değerlerini `scripts/fetch_and_write.py` içinde düzenleyebilirsiniz.
- Prompt metnini `prompts/post_system_prompt.md` dosyasından güncelleyerek yazım stilini ince ayarlayabilirsiniz.

Bu adımları tamamladıktan sonra sistem tamamen otomatik çalışır; sizin yapmanız gereken sadece gerektiğinde kaynak listesini veya promptu güncellemek ve API anahtarınızı geçerli tutmaktır.
