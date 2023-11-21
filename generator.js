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
                <div class="card h-100 ${person.sex == "Male" ? "male" : "female"}" style="width: 18rem;">
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
                            Birth date: <span class="fw-bold">${person.birth_date}</span> (${person.age} ans)<br>
                            At <span class="fw-bold">${person.birth_place}</span>
                        </li>
                        <li class="list-group-item">
                            <span class="fw-bold">Hair: </span>${person.hair}<br>
                            <span class="fw-bold">Eyes: </span>${person.eyes}
                        </li>
                        <li class="list-group-item">
                            <span class="fw-bold">Height: </span>${(3.28084 * person.height).toFixed(2)} ft (${person.height} m)<br>
                            <span class="fw-bold">Weight: </span>${person.weight} kg
                        </li>
                        <li class="list-group-item"><span class="fw-bold">Ethnic group: </span>${person.ethnic_group}</li>
                        <li class="list-group-item"><span class="fw-bold">Languages: </span>${person.languages}</li>
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
        <div class="card h-100 ${person.sex == "Male" ? "male" : "female"}" style="width: 18rem;">
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
                    Birth date: <span class="fw-bold">${person.birth_date}</span> (${person.age} ans)<br>
                    At <span class="fw-bold">${person.birth_place}</span>
                </li>
                <li class="list-group-item">
                    <span class="fw-bold">Hair: </span>${person.hair}<br>
                    <span class="fw-bold">Eyes: </span>${person.eyes}
                </li>
                <li class="list-group-item">
                    <span class="fw-bold">Height: </span>${(3.28084 * person.height).toFixed(2)} ft (${person.height} m)<br>
                    <span class="fw-bold">Weight: </span>${person.weight} kg
                </li>
                <li class="list-group-item"><span class="fw-bold">Ethnic group: </span>${person.ethnic_group}</li>
                <li class="list-group-item"><span class="fw-bold">Languages: </span>${person.languages}</li>
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
    let hair = get_hair(key_country, age, (kind == "Human" && sex == "Male"));
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
        case "Male":
            gender = "male";
            break;
        case "Female":
            gender = "female";
            break;
    }

    let age;
    if (person.age < 7) age = "infant";
    else if (person.age < 16) age = "child";
    else if (person.age < 23) age = "young-adult";
    else if (person.age < 50) age = "adult";
    else age = "elderly";
    if (person.age >= 23 && person.kind == "Warlock") age = rand(1, 100) < 50 ? "young-adult" : "adult";

    let ethnicity;
    switch (person.ethnic_group) {
        case "White" :
            ethnicity = "white";
            break;
        case "Black" :
            ethnicity = "black";
            break;
        case "Asian" :
            ethnicity = "asian";
            break;
        case "Latino" :
            ethnicity = "latino";
            break;
    }

    let eye_color;
    switch (person.eyes) {
        case "Light brown":
        case "Brown":
        case "Black":
        case "Hazel":
            eye_color = "brown";
            break;
        case "Light blue":
        case "Blue":
            eye_color = "blue";
            break;
        case "Gray":
            eye_color = "gray";
            break;
        case "Green":
            eye_color = "green";
            break;
    }

    let hair_color;
    switch (person.hair) {
        case "Dark blond":
            hair_color = "brown";
            break;
        case "Blond":
            hair_color = "blond";
            break;
        case "Black":
            hair_color = "black";
            if (age == "elderly") hair_color = "gray";
            break;
        case "Gray":
            hair_color = "gray";
            break;
        case "Red":
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
        'Male': 1, 'Female': 1
    });
}

function get_kind()
{
    let kind = $("#kind_input").val();
    if (kind && kind.length > 0) return kind;
    return weighted_random({
        'Human': 10, 'Werewolf': 3, 'Vampire': 4, 'Warlock': 8
    });
}

function get_birth_date(kind)
{
    let age = 0;
    switch(kind) {
        case "Human":
            age = rand(20, 80);
            break;
        case "Werewolf":
            age = rand(17, 100);
            break;
        case "Warlock":
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
    if (! $("#weighted_rdn").is(':checked')) usa_proba = -1;
    else if (age > 800) usa_proba = 5;
    else if (age > 600) usa_proba = 10;
    else if (age > 400) usa_proba = 20;
    else if (age > 300) usa_proba = 40;
    else if (age > 200) usa_proba = 60;

    if (rand(1, 100) < usa_proba) return "usa";

    let weighted_countries = {};
    for (const [key, country] of Object.entries(BIRTH_PLACES.countries)) {
        if (key == "usa" && usa_proba > 0) continue;
        weighted_countries[key] = $("#weighted_rdn").is(':checked') ? country.population : 1;
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
    let gender = sex == "Male" ? "male" : "female";

    let name1 = normalize_case(array_rand(NAMES[key_country_eq + "_" + gender]));

    switch (key_country_eq) {
        case "russia":
            if (sex == "Male")
                return name1 + normalize_case(array_rand(NAMES.russia_patro)) + "ich";
            else
                return name1 + " " + normalize_case(array_rand(NAMES.russia_patro)) + "na";
        case "ukraine":
            if (sex == "Male")
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
            if (sex == "Male") {
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
            if (sex == "Male") {
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
            if (sex == "Male") {
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
            if (sex == "Male") return array_rand(NAMES.greece_lastname_male);
            else return array_rand(NAMES.greece_lastname_female);
    }

    let names = NAMES[key_country_eq + '_lastname'];
    return normalize_case(array_rand(names));
}

function get_languages(key_country)
{
    let all_languages = {
        // "Anglais": 1348,
        "Mandarin (China)": 1120,
        "Hindi (India)": 600,
        "Spanish": 543,
        "Arabic": 274,
        "Bengali": 268,
        "French": 267,
        "Russian": 258,
        "Portuguese": 258,
        "Indonésien": 199,
        "Indonesian": 135,
        "Japanese": 126,
        "Turkish": 88,
        "Korean": 82,
        "Vietnamese": 82,
        "Hausa": 75, // Niger
        "Iranian": 74,
        "Egyptian": 70,
        "Swahili": 69, // Tanzanie
        "Javanese": 68, // Indonésie
        "Italian": 68,
        "Thai": 61,
        "Amharic": 57, // Ethiopie
        "Filipino": 45,
        "Yoruba": 43, // Niger
        "Burmese": 43,
        "Polish": 41
    };

    let indian_languages = {
        // "Hindi (India)": 600,
        "Urdu (India)": 230,
        "Marathi (India)": 99,
        "Telugu (India)": 96,
        "Tamil (India)": 85,
        "West Punjabi (India)": 65,
        "Gujarati (India)": 62,
        "Kannada (India)": 59,
        "East Punjabi (India)": 52,
        "Odia (India)": 40
    };

    let chinese_languages = {
        // "Mandarin (China)": 1120,
        "Cantonese (China)": 85,
        "Wu (China)": 82,
        "Minnan (China)": 49,
        "Jin (China)": 47,
        "Hakka (China)": 44,
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
    let result = "English";
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
        if (rand(1, 100) < bald_proba) return "Bald";
    }

    switch (key_country) {
        case "ireland":
            return weighted_random({"Black": 10, "Dark blond": 25, "Blond": 25, "Red": 30});
        case "italy":
            return weighted_random({"Black": 30, "Dark blond": 55, "Blond": 10, "Red": 5});
        case "germany":
        case "poland":
        case "russia":
        case "ukraine":
        case "australia":
            return weighted_random({"Black": 10, "Dark blond": 20, "Blond": 60, "Red": 20});
    }

    switch (BIRTH_PLACES.countries[key_country].ethnic_group) {
        case "Asian":
            return weighted_random({"Black": 90, "Dark blond": 8, "Blond": 1, "Red": 1});
        case "Black":
            return weighted_random({"Black": 90, "Dark blond": 10});
        case "White":
            return weighted_random({"Black": 25, "Dark blond": 40, "Blond": 25, "Red": 10});
        case "Latino":
            return weighted_random({"Black": 75, "Dark blond": 20, "Blond": 4, "Red": 1});
    }

    return weighted_random({"Black": 40, "Dark blond": 50, "Blond": 10});
}

function get_eyes(ethnic_group)
{
    switch (ethnic_group) {
        case "White":
            return weighted_random({"Light blue": 1, "Blue": 30, "Light brown": 1, "Brown": 33, "Black": 1, "Green": 15, "Hazel": 16, "Gray": 1});
        case "Black":
            return weighted_random({"Light blue": 0, "Blue": 0, "Light brown": 1, "Brown": 84, "Black": 12, "Green": 0, "Hazel": 1, "Gray": 0});
        case "Asian":
            return weighted_random({"Light blue": 0, "Blue": 5, "Light brown": 1, "Brown": 60, "Black": 30, "Green": 0, "Hazel": 2, "Gray": 2});
        case "Latino":
            return weighted_random({"Light blue": 0, "Blue": 2, "Light brown": 2, "Brown": 79, "Black": 6, "Green": 4, "Hazel": 5, "Gray": 0});
        case "Native american":
            return weighted_random({"Light blue": 1, "Blue": 10, "Light brown": 1, "Brown": 61, "Black": 5, "Green": 5, "Hazel": 16, "Gray": 1});
        default:
            return weighted_random({"Light blue": 1, "Blue": 26, "Light brown": 1, "Brown": 45, "Black": 2, "Green": 9, "Hazel": 18, "Gray": 1});
    }
}