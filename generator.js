$( document ).ready(function() {// Create items array
    var countries = Object.keys(BIRTH_PLACES.countries).map(function(key) {
        return [key, BIRTH_PLACES.countries[key].country];
    });
    countries.sort(function(first, second) {
        return first[1].localeCompare(second[1]);
    });

    for (const [key, country] of countries) {
        $("#country_input").append(
            `<option value="${key}">${country}</option>`
        );
    }

    generate();
});

class MyDate
{
    constructor(year, month, day)
    {
        this.yyyy = year;
        this.mm = month;
        this.dd = day;
    }

    n_days()
    {
        let days_by_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        let start_year = -5000;
        let n_years = this.yyyy - start_year;
        let n_dd = 365 * n_years + Math.floor(n_years / 4);
        for (let i = 0; i < this.mm; ++i)
        {
            n_dd += days_by_month[i];
        }
        n_dd += this.dd;
        return n_dd;
    }

    static date_from_n_days(n_dd)
    {
        // Jours restants apres avoir gerer les annees par paquets de 4 ans
        let remainder = n_dd % (365 * 4 + 1);

        //   [Nombre d'annees (gerees par paquet de 4 ans)] + [Nombre d'annees dans le reste]
        let years = Math.floor(n_dd / (365 * 4 + 1)) * 4  + Math.floor(remainder / 365);

        // Jours restants = [Jours totaux] - [Jours annees non bissextiles] - [Annees bissextiles]
        let remainding_days = n_dd - 365 * years - Math.floor(years / 4);

        let days_by_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        let months = 0;
        for (months = 0; months < 12, remainding_days > 0; ++months)
        {
            remainding_days -= days_by_month[months];
        }
        if (months > 0)
        {
            remainding_days += days_by_month[months - 1];
        }

        return new MyDate(years, months, remainding_days);
    }

    diff(other)
    {
        let days = this.n_days() - other.n_days();
        return MyDate.date_from_n_days(days);
    }

    to_string()
    {
        return String(this.dd).padStart(2, '0') + '/' + String(this.mm).padStart(2, '0') + '/' + String(this.yyyy).padStart(4, '0');
    }

    get year()
    {
        return this.yyyy;
    }

    get month()
    {
        return this.mm;
    }

    get day()
    {
        return this.dd;
    }

    get age()
    {
        let diff_date = MyDate.today().diff(this);
        return diff_date.yyyy;
    }

    static parse(string)
    {
        let array = string.split('/');
        let dd = Number(array[0]);
        let mm = Number(array[1]);
        let yyyy = Number(array[2]);

        return new MyDate(yyyy, mm, dd);
    }

    static today()
    {
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
        var yyyy = today.getFullYear();
        return MyDate.parse(dd + '/' + mm + '/' + yyyy);
    }
}

function rand(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function array_rand(array)
{
    return array[Math.floor(Math.random() * array.length)];
}

function unset(dict, key)
{
    delete dict[key];
}

function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

function weighted_random(array, num = 1)
{
    let norm = 0;
    for (const [key, w] of Object.entries(array)) {
        norm += w;
    }

    let items = [];

    for (let i = 0; i < num; ++i) {
        let rdn = rand(1, norm);
        let sum = 0;
        let chosenItem;
        for (const [key, w] of Object.entries(array)) {
            sum += w;
            if ( sum >= rdn ) {
                chosenItem = key;
                break;
            }
        }
        items.push(chosenItem);
    }

    if (num == 1) {
        return items[0];
    }

    return items;
}

function stats_rand_gen_normal(av, sd)
{
    let x = Math.random();
    let y = Math.random();

    return Math.sqrt(-2 * Math.log(x)) * Math.cos(2 * Math.PI * y) * sd + av;
}

function generate()
{
    if ($('#only_names').is(":checked")) {
        generate_names();
    }
    else if ($('#images_input').is(":checked")) {
        generate_with_images();
    }
    else {
        generate_no_images();
    }
}

function generate_names()
{
    $("#gallery").html("");
    for (let i = 0; i < $("#number").val(); ++i) {
        let html = html_name();
        $("#gallery").append(html);
    }
}

function generate_no_images()
{
    $("#gallery").html("");
    for (let i = 0; i < $("#number").val(); ++i) {
        let html = html_person();
        $("#gallery").append(html);
    }
}

function generate_with_images()
{
    $("#gallery").html("");
    for (let i = 0; i < $("#number").val(); ++i) {
        let person = generate_person();

        let images = $("<div></div>");
        images.load(`${create_url(person)} img[src^='https://images.generated.photos/']`, function() {
            console.log("Done");
            let random_image = images.children().eq(rand(0, images.children().length - 1));
            url_img = random_image.attr('src');
            let html = `
            <div class="col">
                <div class="card h-100 ${person.sex == "Homme" ? "male" : "female"}" style="width: 18rem;">
                    <div class="card-header text-center">
                        <h4>${person.first_name} ${person.last_name}</h4>
                    </div>
                    <img src="${url_img}">
                    <div class="card-body">
                        <p class="card-text text-center">
                            ${person.sex}, <span class="fw-bold">${person.kind}</span>
                        </p>
                    </div>
                    <ul class="list-group list-group-flush">
                        <li class="list-group-item">
                            Né le <span class="fw-bold">${person.birth_date}</span> (${person.age} ans)<br>
                            A <span class="fw-bold">${person.birth_place}</span>
                        </li>
                        <li class="list-group-item">
                            <span class="fw-bold">Cheveux : </span>${person.hair}<br>
                            <span class="fw-bold">Yeux : </span>${person.eyes}
                        </li>
                        <li class="list-group-item">
                            <span class="fw-bold">Taille : </span>${person.height} m<br>
                            <span class="fw-bold">Poids : </span>${person.weight} kg
                        </li>
                        <li class="list-group-item"><span class="fw-bold">Ethnie : </span>${person.ethnic_group}</li>
                        <li class="list-group-item"><span class="fw-bold">Langues : </span>${person.languages}</li>
                    </ul>
                </div>
            </div>
            `;
            $("#gallery").append(html);
        });
    }
}

function html_name()
{
    return `<div>${generate_name()}</div>`;
}
function generate_name()
{
    let sex = get_sex();
    let kind = get_kind();
    let birth_date = get_birth_date(kind);
    let age = MyDate.parse(birth_date).age;
    let key_country = get_country(age);
    let first_name = get_first_name(sex, key_country);
    let last_name = get_last_name(sex, key_country);

    return first_name + " " + last_name;
}

function html_person()
{
    let person = generate_person();
    return `
    <div class="col">
        <div class="card h-100 ${person.sex == "Homme" ? "male" : "female"}" style="width: 18rem;">
            <div class="card-header text-center">
                <h4>${person.first_name} ${person.last_name}</h4>
            </div>
            <div class="card-body">
                <p class="card-text text-center">
                    ${person.sex}, <span class="fw-bold">${person.kind}</span>
                </p>
            </div>
            <ul class="list-group list-group-flush">
                <li class="list-group-item">
                    Né le <span class="fw-bold">${person.birth_date}</span> (${person.age} ans)<br>
                    A <span class="fw-bold">${person.birth_place}</span>
                </li>
                <li class="list-group-item">
                    <span class="fw-bold">Cheveux : </span>${person.hair}<br>
                    <span class="fw-bold">Yeux : </span>${person.eyes}
                </li>
                <li class="list-group-item">
                    <span class="fw-bold">Taille : </span>${person.height} m<br>
                    <span class="fw-bold">Poids : </span>${person.weight} kg
                </li>
                <li class="list-group-item"><span class="fw-bold">Ethnie : </span>${person.ethnic_group}</li>
                <li class="list-group-item"><span class="fw-bold">Langues : </span>${person.languages}</li>
            </ul>
        </div>
    </div>
    `;
}
function generate_person()
{
    let sex = get_sex();
    let kind = get_kind();
    let birth_date = get_birth_date(kind);
    let age = MyDate.parse(birth_date).age;
    let key_country = get_country(age);
    let birth_place = get_birth_place(key_country);
    let ethnic_group = BIRTH_PLACES.countries[key_country].ethnic_group;
    let first_name = get_first_name(sex, key_country);
    let last_name = get_last_name(sex, key_country);
    let languages = get_languages(key_country);
    let height = get_height();
    let weight = get_weight(height);
    let hair = get_hair(key_country, age, (kind == "Humain" && sex == "Homme"));
    let eyes = get_eyes(ethnic_group);

    return {
        "sex": sex,
        "kind": kind,
        "birth_date": birth_date,
        "age": age,
        "key_country": key_country,
        "birth_place": birth_place,
        "ethnic_group": ethnic_group,
        "first_name": first_name,
        "last_name": last_name,
        "languages": languages,
        "height": height / 100,
        "weight": weight,
        "hair": hair,
        "eyes": eyes
    };
}

function create_url(person) {
    let gender;
    switch (person.sex) {
        case "Homme":
            gender = "male";
            break;
        case "Femme":
            gender = "female";
            break;
    }

    let age;
    if (person.age < 7) age = "infant";
    else if (person.age < 16) age = "child";
    else if (person.age < 23) age = "young-adult";
    else if (person.age < 50) age = "adult";
    else age = "elderly";
    if (person.age >= 23 && person.kind == "Sorcier") age = rand(1, 100) < 50 ? "young-adult" : "adult";

    let ethnicity;
    switch (person.ethnic_group) {
        case "Blanche" :
            ethnicity = "white";
            break;
        case "Noire" :
            ethnicity = "black";
            break;
        case "Asiatique" :
            ethnicity = "asian";
            break;
        case "Hispanique" :
            ethnicity = "latino";
            break;
    }

    let eye_color;
    switch (person.eyes) {
        case "Marrons clairs":
        case "Marrons":
        case "Noirs":
        case "Noisettes":
            eye_color = "brown";
            break;
        case "Bleus clairs":
        case "Bleus":
            eye_color = "blue";
            break;
        case "Gris":
            eye_color = "gray";
            break;
        case "Verts":
            eye_color = "green";
            break;
    }

    let hair_color;
    switch (person.hair) {
        case "Chatains":
            hair_color = "brown";
            break;
        case "Blonds":
            hair_color = "blond";
            break;
        case "Noirs":
            hair_color = "black";
            if (age == "elderly") hair_color = "gray";
            break;
        case "Gris":
            hair_color = "gray";
            break;
        case "Roux":
            hair_color = "red";
            break;
        default:
            hair_color = "";
            break;
    }

    return `https://generated.photos/faces/${age}/${ethnicity}-race/${hair_color}-hair/${gender}/${eye_color}-eyes`;
}

function get_sex()
{
    let sex = $("#sex_input").val();
    if (sex && sex.length > 0) return sex;
    return weighted_random({
        'Homme': 1, 'Femme': 1
    });
}

function get_kind()
{
    let kind = $("#kind_input").val();
    if (kind && kind.length > 0) return kind;
    return weighted_random({
        'Humain': 10, 'Loup-Garou': 3, 'Vampire': 4, 'Sorcier': 8
    });
}

function get_birth_date(kind)
{
    let age = 0;
    switch(kind) {
        case "Humain":
            age = rand(20, 80);
            break;
        case "Loup-Garou":
            age = rand(17, 100);
            break;
        case "Sorcier":
            var ages = {};
            ages[rand(10, 19)] = 4;
            ages[rand(20, 199)] = 37;
            ages[rand(200, 499)] = 37;
            ages[rand(500, 599)] = 11;
            ages[rand(600, 799)] = 5;
            ages[rand(800, 999)] = 3;
            ages[rand(1000, 1499)] = 2;
            ages[rand(1500, 1999)] = 1;
            age = weighted_random(ages);
            break;
        case "Vampire":
            var ages = {};
            ages[rand(10, 19)] = 4;
            ages[rand(20, 199)] = 55;
            ages[rand(200, 499)] = 30;
            ages[rand(500, 599)] = 10;
            ages[rand(600, 800)] = 1;
            age = weighted_random(ages);
            break;
        default:
            return null;
    }
    age = Number(age);
    let year = 2021 - age;
    let month = rand(1, 12);
    let day;
    if (month == 2) day = rand(1, 28);
    else if (month == 4 || month == 6 || month == 9 || month == 11) day = rand(1, 30);
    else day = rand(1, 31);
    let date = new MyDate(year, month, day);
    return date.to_string();
}

function get_country(age)
{
    let country = $("#country_input").val();
    if (country && country.length > 0) return country;

    // Choose the probability of beeing born in the usa, based on the age;
    let usa_proba = -1; // Pick as any human of this generation, directly weighted by the population
    if (age > 800) usa_proba = 5;
    else if (age > 600) usa_proba = 10;
    else if (age > 400) usa_proba = 20;
    else if (age > 300) usa_proba = 40;
    else if (age > 200) usa_proba = 60;

    if (rand(1, 100) < usa_proba) return "usa";

    let weighted_countries = {};
    for (const [key, country] of Object.entries(BIRTH_PLACES.countries)) {
        if (key == "usa" && usa_proba > 0) continue;
        weighted_countries[key] = country.population;
    }
    return weighted_random(weighted_countries);
}

function get_birth_place(key_country, immigrant_proba = 100)
{
    // If a country has been selected by the user, birth place is in it
    let input_country = $("#country_input").val();
    if (input_country && input_country.length > 0) {
        return weighted_random(BIRTH_PLACES[input_country + "_cities"]) + ", " + BIRTH_PLACES.countries[input_country].country;
    }

    // Direct immigrant, born in another country
    if (key_country != "usa" && rand(1, 100) < immigrant_proba) {
        return weighted_random(BIRTH_PLACES[key_country + "_cities"]) + ", " + BIRTH_PLACES.countries[key_country].country;
    }

    // Either a child of former immigrants, or an american
    return weighted_random(BIRTH_PLACES.usa_cities) + ", Etats-Unis";
}

function capitalize_first_letter(words, separator) {
    var separateWord = words.toLowerCase().split(separator);
    for (var i = 0; i < separateWord.length; i++) {
       separateWord[i] = separateWord[i].charAt(0).toUpperCase() +
       separateWord[i].substring(1);
    }
    return separateWord.join(' ');
}

function normalize_case(string)
{
    let to_lower = string.toLowerCase();
    let upper_first = capitalize_first_letter(to_lower, ' ');
    upper_first = capitalize_first_letter(upper_first, '\'');
    upper_first = capitalize_first_letter(upper_first, '-');
    return upper_first;
}

function get_first_name(sex, key_country)
{
    let key_country_eq = NAMES.country_for_names[key_country];
    let gender = sex == "Homme" ? "male" : "female";

    let name1 = normalize_case(array_rand(NAMES[key_country_eq + "_" + gender]));

    switch (key_country_eq) {
        case "russia":
            if (sex == "Homme")
                return name1 + normalize_case(array_rand(NAMES.russia_patro)) + "ich";
            else
                return name1 + " " + normalize_case(array_rand(NAMES.russia_patro)) + "na";
        case "ukraine":
            if (sex == "Homme")
                return name1 + " " + normalize_case(array_rand(NAMES.ukraine_patro)) + "ych";
            else
                return name1 + " " + normalize_case(array_rand(NAMES.ukraine_patro)) + "na";
    }

    return name1;
}

function get_last_name(sex, key_country)
{
    let key_country_eq = NAMES.country_for_names[key_country];

    switch (key_country_eq) {
        case "spain":
            let name1 = array_rand(NAMES.spain_lastname);
            let name2 = array_rand(NAMES.spain_lastname);
            let names = {};
            names[name1                 ] = 8;
            names[name1 + ' de ' + name2] = 1;
            names[name1 + ' y '  + name2] = 1;
            return weighted_random(names);

        case "arabic":
            let father = array_rand(NAMES.arabic_male);
            let god = array_rand(NAMES.arabic_laqab);
            let surname = array_rand(NAMES.arabic_lastname);
            let nasab; let laqab;
            if (sex == "Homme") {
                nasab = weighted_random({"Ibn": 5, "Bin Abi": 1}) + father;
                laqab = "Abdul-" + god;
            }
            else {
                nasab = weighted_random({"Bint": 5, "Bint Abi": 1}) + father;
                laqab = "Amatul-" + god;
            }
            let possibilities = [
                nasab,
                nasab + ' ' + surname,
                laqab,
                laqab + ' ' + surname
            ];
            return normalize_case(array_rand(possibilities));
        
        case "russia":
            if (sex == "Homme") {
                let rdn = rand(1, 200+5+20+5+25);
                if (rdn < 200) return array_rand(NAMES.russia_lastname_v);
                if (rdn < 205) return array_rand(NAMES.russia_lastname_sk) + "i";
                if (rdn < 225) return array_rand(NAMES.russia_lastname_sk) + "y";
                if (rdn < 230) return array_rand(NAMES.russia_lastname_sk) + "iy";
                else return array_rand(NAMES.russia_lastname_n);
            }
            else {
                let rdn = rand(1, 300+50+25);
                if (rdn < 300) return array_rand(NAMES.russia_lastname_v) + "a";
                if (rdn < 350) return array_rand(NAMES.russia_lastname_sk) + "aya";
                else return array_rand(NAMES.russia_lastname_n);
            }
        
        case "ukraine":
            let rdn = rand(1, 30+10+5);
            if (sex == "Homme") {
                if (rdn < 30) return array_rand(NAMES.ukraine_lastname_n);
                if (rdn < 40) return array_rand(NAMES.ukraine_lastname_v);
                else return array_rand(NAMES.ukraine_lastname_sk) + "yi";
            }
            else {
                let rdn = rand(1, 300+50+25);
                if (rdn < 30) return array_rand(NAMES.ukraine_lastname_n);
                if (rdn < 40) return array_rand(NAMES.ukraine_lastname_v) + "a";
                else return array_rand(NAMES.ukraine_lastname_sk) + "aya";
            }

        case "greece":
            if (sex == "Homme") return array_rand(NAMES.greece_lastname_male);
            else return array_rand(NAMES.greece_lastname_female);
    }

    let names = NAMES[key_country_eq + '_lastname'];
    return normalize_case(array_rand(names));
}

function get_languages(key_country)
{
    let all_languages = {
        // "Anglais": 1348,
        "Mandarin (Chine)": 1120,
        "Hindi (Inde)": 600,
        "Espagnol": 543,
        "Arabe": 274,
        "Bengali": 268,
        "Français": 267,
        "Russe": 258,
        "Portugais": 258,
        "Indonésien": 199,
        "Allemand": 135,
        "Japonais": 126,
        "Turc": 88,
        "Coréen": 82,
        "Vietnamien": 82,
        "Haoussa": 75, // Niger
        "Iranien": 74,
        "Egyptien": 70,
        "Swahili": 69, // Tanzanie
        "Javanais": 68, // Indonésie
        "Italien": 68,
        "Thaï": 61,
        "Amharic": 57, // Ethiopie
        "Philippin": 45,
        "Yoruba": 43, // Niger
        "Birman": 43,
        "Polonais": 41
    };

    let indian_languages = {
        // "Hindi (Inde)": 600,
        "Urdu (Inde)": 230,
        "Marathi (Inde)": 99,
        "Telugu (Inde)": 96,
        "Tamil (Inde)": 85,
        "Pendjabi de l'Ouest (Inde)": 65,
        "Gujarati (Inde)": 62,
        "Kannada (Inde)": 59,
        "Pendjabi de l'Est (Inde)": 52,
        "Odia (Inde)": 40
    };

    let chinese_languages = {
        // "Mandarin (Chine)": 1120,
        "Cantonais (Chine)": 85,
        "Wu (Chine)": 82,
        "Minnan (Chine)": 49,
        "Jin (Chine)": 47,
        "Hakka (Chine)": 44,
    };

    let languages = [];
    if (BIRTH_PLACES.countries[key_country].language.length > 0)
        languages = BIRTH_PLACES.countries[key_country].language.split(', ');

    // Remove the languages from the pickable array
    for (let lang of languages) {
        unset(all_languages, lang);
    }
    // Eventually, pick new languages
    let dialect_prob = 50;
    while (true) {
        // Russian roulette to pick an other language or not (20%)
        if (rand(1, 100) > 20) break;
        let other;
        // Choose if it is a dialect from the same country or no
        let dialect = false;
        if (dialect_prob > 0 && key_country == "india") {
            dialect = rand(1, 100) < dialect_prob;
            if (dialect) {
                other = weighted_random(indian_languages);
            }
        }
        else if (dialect_prob > 0 && key_country == "china") {
            dialect = rand(1, 100) < dialect_prob;
            if (dialect) {
                other = weighted_random(chinese_languages);
            }
        }
        // If a dialect was picked, reduce the probability to have an other one
        if (dialect) {
            dialect_prob -= 20;
        }
        // If no dialect was picked, the probability is reduces to zero
        else {
            dialect_prob = 0;
            // and we pick an other languages
            other = weighted_random(all_languages);
        }
        languages.push(other);
        unset(all_languages, other);
        unset(indian_languages, other);
        unset(chinese_languages, other);
    }
    
    // Create the string
    let result = "Anglais";
    for (let lang of languages) {
        result += ", " + lang;
    }
    return result;
}

function get_height()
{
    return Math.floor(clamp(stats_rand_gen_normal(1.7, 0.1), 1.4, 2.2) * 100 + rand(0, 9));
}

function get_weight(height)
{
    let cateogry = weighted_random({
        "severe_thinness": 0,
        "moderate_thinness": 2,
        "mild_thinness": 8,
        "average": 50,
        "pre_obese": 30,
        "obese_class_1": 7,
        "obese_class_2": 3,
        "obese_class_3": 0
    });
    let bmi;
    switch (cateogry) {
        case "severe_thinness":
            bmi = rand(150, 159) / 10;
            break;
        case "moderate_thinness":
            bmi = rand(160, 169) / 10;
            break;
        case "mild_thinness":
            bmi = rand(170, 184) / 10;
            break;
        case "average":
            bmi = rand(185, 249) / 10;
            break;
        case "pre_obese":
            bmi = rand(250, 299) / 10;
            break;
        case "obese_class_1":
            bmi = rand(300, 349) / 10;
            break;
        case "obese_class_2":
            bmi = rand(350, 399) / 10;
            break;
        case "severe_thinness":
            bmi = rand(400, 410) / 10;
            break;
    }
    return Math.floor(bmi * (height / 100) * (height / 100));
}

function get_hair(key_country, age, can_be_bald = false)
{
    if (can_be_bald) {
        let bald_proba = 0; // Pick as any human of this generation, directly weighted by the population
        if (age > 80) bald_proba = 70;
        else if (age > 70) bald_proba = 60;
        else if (age > 60) bald_proba = 40;
        else if (age > 50) bald_proba = 20;
        else if (age > 40) bald_proba = 10;
        else if (age > 30) bald_proba = 5;
        else if (age > 20) bald_proba = 2;
        if (rand(1, 100) < bald_proba) return "Chauve";
    }

    switch (key_country) {
        case "ireland":
            return weighted_random({"Noirs": 10, "Chatains": 25, "Blonds": 25, "Roux": 30});
        case "italy":
            return weighted_random({"Noirs": 30, "Chatains": 55, "Blonds": 10, "Roux": 5});
        case "germany":
        case "poland":
        case "russia":
        case "ukraine":
        case "australia":
            return weighted_random({"Noirs": 10, "Chatains": 20, "Blonds": 60, "Roux": 20});
    }

    switch (BIRTH_PLACES.countries[key_country].ethnic_group) {
        case "Asiatique":
            return weighted_random({"Noirs": 90, "Chatains": 8, "Blonds": 1, "Roux": 1});
        case "Noire":
            return weighted_random({"Noirs": 90, "Chatains": 10});
        case "Blanche":
            return weighted_random({"Noirs": 25, "Chatains": 40, "Blonds": 25, "Roux": 10});
        case "Hispanique":
            return weighted_random({"Noirs": 75, "Chatains": 20, "Blonds": 4, "Roux": 1});
    }

    return weighted_random({"Noirs": 40, "Chatains": 50, "Blonds": 10});
}

function get_eyes(ethnic_group)
{
    switch (ethnic_group) {
        case "Blanche":
            return weighted_random({"Bleus clairs": 1, "Bleus": 30, "Marrons clairs": 1, "Marrons": 33, "Noirs": 1, "Verts": 15, "Noisettes": 16, "Gris": 1});
        case "Noire":
            return weighted_random({"Bleus clairs": 0, "Bleus": 0, "Marrons clairs": 1, "Marrons": 84, "Noirs": 12, "Verts": 0, "Noisettes": 1, "Gris": 0});
        case "Asiatique":
            return weighted_random({"Bleus clairs": 0, "Bleus": 5, "Marrons clairs": 1, "Marrons": 60, "Noirs": 30, "Verts": 0, "Noisettes": 2, "Gris": 2});
        case "Hispanique":
            return weighted_random({"Bleus clairs": 0, "Bleus": 2, "Marrons clairs": 2, "Marrons": 79, "Noirs": 6, "Verts": 4, "Noisettes": 5, "Gris": 0});
        case "Amérindien":
            return weighted_random({"Bleus clairs": 1, "Bleus": 10, "Marrons clairs": 1, "Marrons": 61, "Noirs": 5, "Verts": 5, "Noisettes": 16, "Gris": 1});
        default:
            return weighted_random({"Bleus clairs": 1, "Bleus": 26, "Marrons clairs": 1, "Marrons": 45, "Noirs": 2, "Verts": 9, "Noisettes": 18, "Gris": 1});
    }
}