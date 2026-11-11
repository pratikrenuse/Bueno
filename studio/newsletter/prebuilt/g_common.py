import json, subprocess, sys
def L(en, no, sv): return {"en": en, "no": no, "sv": sv}

BUENO_STEPS = [
    L("Our team is there when you need us, by phone, WhatsApp, chat and email.",
      "Teamet vårt er der når du trenger oss, på telefon, WhatsApp, chat og e-post.",
      "Vårt team finns där när du behöver oss, via telefon, WhatsApp, chatt och e-post."),
    L("You register a direct debit change in the app, and we handle the rest.",
      "Du registrerer en endring av autotrekk i appen, og vi tar oss av resten.",
      "Du registrerar en ändring av autogiro i appen, och vi sköter resten."),
    L("You can see what your home is worth today and keep your property papers in one place.",
      "Du kan se hva boligen er verdt i dag og samle eiendomspapirene på ett sted.",
      "Du kan se vad din bostad är värd i dag och samla dina fastighetspapper på ett ställe."),
    L("We file your Spanish non-resident tax return, the Modelo 210, for you.",
      "Vi leverer den spanske skattemeldingen for ikke-residenter, Modelo 210, for deg.",
      "Vi lämnar den spanska deklarationen för icke-residenter, Modelo 210, åt dig."),
]

def cta(num, photo="support"):
    return {"type": "cta", "num": num, "photo": photo,
            "eyebrow": L("Bueno Account", "Bueno-kontoen", "Bueno-kontot"),
            "title": L("Your home in Spain, without the paperwork", "Boligen i Spania, uten papirarbeidet", "Din bostad i Spanien, utan pappersarbetet"),
            "lead": L("Bueno brings the running of your Spanish home into one place, with a professional team that helps you whenever you need it.",
                      "Bueno samler driften av boligen din i Spania på ett sted, med et profesjonelt team som hjelper deg når du trenger det.",
                      "Bueno samlar skötseln av din bostad i Spanien på ett ställe, med ett professionellt team som hjälper dig när du behöver det."),
            "steps": BUENO_STEPS,
            "price": L("€99 a year", "€99 per år", "€99 per år"),
            "price_note": L("Bueno is used by property owners from over 30 countries, who rate us 4.9 out of 5. Tax filing starts from €50.",
                            "Bueno brukes av eiendomseiere fra over 30 land, som gir oss 4,9 av 5. Levering av skattemeldingen starter fra €50.",
                            "Bueno används av fastighetsägare från över 30 länder, som ger oss 4,9 av 5. Deklarationen kostar från €50."),
            "button": L("Get started at getbueno.com", "Kom i gang på getbueno.com/no", "Kom igång på getbueno.com/se")}

def write(spec):
    p = f"/home/claude/guide/studio/guides/specs/{spec['slug']}.json"
    json.dump(spec, open(p, "w"), ensure_ascii=False, indent=1)
    for lang in ("en", "no", "sv"):
        for s in json.dumps(spec, ensure_ascii=False).split('"'):
            pass
    bad = [c for c in ("—", "–") if c in json.dumps(spec, ensure_ascii=False)]
    assert not bad, f"dash in {spec['slug']}"
    return p
