import React from "react";
import "./CharacterCard.css"; // hier kommt das Styling rein
import { useState } from "react";

function CharacterCard({
  name,
  level,
  image,
  charMagicSource,
  races,
  raceClasses,
  jobClasses,
  skills,
  senseOfJustice,
  raceClassPoints,
  jobClassPoints,
  ASactive,
  MSactive,
  HPValue,
  MPValue,
  PATKValue,
  PDEFValue,
  MATKValue,
  MDEFValue,
  AGIValue,
  RESValue,
  SPEValue,
})
{
    /*const [stats, setStats] = useState(
    {
        HP: 50,
        MP: 40,
        "PHY.ATK": 65,
        "PHY.DEF": 60,
        "MAG.ATK": 70,
        "MAG.DEF": 55,
        AGILITY: 45,
        RES: 50,
        SPE: 50,
    });*/

    /*const handleStatChange = (stat, value) =>
    {
        setStats((prev) => ({ ...prev, [stat]: Number(value) }));
    };*/

  // Sterne für Level (1 Stern je 10 Level)
  const stars = Math.floor(level / 10);

  // Balken-Berechnung
  const totalLevel = level;
  const racePoints = Object.values(raceClassPoints).reduce((a, b) => a + b, 0);
  const jobPoints = Object.values(jobClassPoints).reduce((a, b) => a + b, 0);
  const usedPercent = (racePoints + jobPoints) / totalLevel * 100;
  const racePercent = (racePoints / totalLevel) * 100;
  const jobPercent = (jobPoints / totalLevel) * 100;
  const restPercent = 100 - (racePercent + jobPercent);

  return (
    <div className="character-card">
      <div className="cardContainer">
        <div className="CC-Left">
          {/* Bild */}
          <div className="image-container">
          {image ? (
            <img src={image} alt="Character" />
          ) : (
            <div className="placeholder">No Image</div>
          )}
          </div>
        </div>
        <div className="CC-Right">
          <div className="innerContainer">
            <div className="left-Header">
              <div className="card-header">
                <p>__________________________</p>
                <h2 style={{ margin: '0px' }}>{name}</h2>
                <p style={{ margin: '0px' }}>(Lv. {level})</p>
                {ASactive === 0 && (
                  <div className="stars">{"★".repeat(stars)}</div>
                )}
                <p>__________________________</p>
              </div>
            </div>
            <div className="right-Header">
            {/* Magiequelle Kreis + Rassen */}
              <div style={{ maxWidth: '140px' }} className="magic-source">
                {charMagicSource.length > 0 && MSactive === 0 &&
                (
                  <div className={`circle circle-${charMagicSource.length}`}>
                  {charMagicSource.map((src, idx) =>
                    (
                      <div key={idx} className={`slice ${src.toLowerCase()}`}></div>
                    ))}
                  </div>
                )}
                  <div className="race-list">{races.join(", ")}</div>
                </div>
            </div>
          </div>

          {/* Sense of Justice */}
          <div className="sense-of-justice">
          <span>Sense of Justice:</span>
          <span>{senseOfJustice}</span>
          </div>

          {/* Race Classes */}
          <div className="class-section">
          <h3>Race Class</h3>
          {raceClasses && raceClasses.length > 0 ? (
            raceClasses.map((cls) =>
            cls.points > 0 ? (
              <div className="class-row" key={cls.name}>
              <span>{cls.name}</span>
              <span>Lv. {cls.points}</span>
              </div>
            ) : null
            )
          ) : (
            <p style={{ color: "gray" }}>No Race Classes</p>
          )}
          </div>

          {/* Job Classes */}
          <div className="class-section">
            <h3>Job Class</h3>
            {jobClasses && jobClasses.length > 0 ? (
              jobClasses.map((cls) =>
              cls.points > 0 ? (
                <div className="class-row" key={cls.name}>
                  <span>{cls.name}</span>
                  <span>Lv. {cls.points}</span>
                </div>
              ) : null
              )
            ) : (
              <p style={{ color: "gray" }}>No Job Classes</p>
            )}
          </div>

          {/* Balken */}
          <div className="progress-bar">
            <div className="bar race" style={{ width: `${racePercent}%` }}></div>
            <div className="bar job" style={{ width: `${jobPercent}%` }}></div>
            <div className="bar rest" style={{ width: `${restPercent}%` }}></div>
          </div>

          </div>
        </div>


      {/* Skills */}
      <div className="skills">
        {skills.slice(0, 4).map((skill, idx) => (
          <span key={idx} className="skill">
            {skill}
          </span>
        ))}
      </div>

      {/* Skala */}
      <div class="overlord-linear-scale">
      <span>0</span>
      <div class="scale-line"></div>
      <span>50</span>
      <div class="scale-line"></div>
      <span>100</span>
      </div>

      {/* Ability Chart */}
      <div className="ability-chart">
        <div className="MergerCC">
          <div className="abilityLeft">HP</div>
          <div className="slider" onChange={(e) => HPValue}
          style={{width: "65%" }}>
            <div className="barValue" style={{ width: `${HPValue}%` }}></div>
          </div>
        </div>
        <div className="MergerCC">
          <div className="abilityLeft">MP</div>
          <div className="slider" onChange={(e) => MPValue}
          style={{width: "65%" }}>
            <div className="barValue" style={{ width: `${MPValue}%` }}></div>
          </div>
        </div>
        <div className="MergerCC">
          <div className="abilityLeft">PHY.ATK</div>
          <div className="slider" onChange={(e) => PATKValue}
          style={{width: "65%" }}>
            <div className="barValue" style={{ width: `${PATKValue}%` }}></div>
          </div>
        </div>
        <div className="MergerCC">
          <div className="abilityLeft">PHY.DEF</div>
          <div className="slider" onChange={(e) => PDEFValue}
          style={{width: "65%" }}>
            <div className="barValue" style={{ width: `${PDEFValue}%` }}></div>
          </div>
        </div>
        <div className="MergerCC">
          <div className="abilityLeft">MAG.ATK</div>
          <div className="slider" onChange={(e) => MATKValue}
          style={{width: "65%" }}>
            <div className="barValue" style={{ width: `${MATKValue}%` }}></div>
          </div>
        </div>
        <div className="MergerCC">
          <div className="abilityLeft">MAG.DEF</div>
          <div className="slider" onChange={(e) => MDEFValue}
          style={{width: "65%" }}>
            <div className="barValue" style={{ width: `${MDEFValue}%` }}></div>
          </div>
        </div>
        <div className="MergerCC">
          <div className="abilityLeft">AGILITY</div>
          <div className="slider" onChange={(e) => AGIValue}
          style={{width: "65%" }}>
            <div className="barValue" style={{ width: `${AGIValue}%` }}></div>
          </div>
        </div>
        <div className="MergerCC">
          <div className="abilityLeft">RES</div>
          <div className="slider" onChange={(e) => RESValue}
          style={{width: "65%" }}>
            <div className="barValue" style={{ width: `${RESValue}%` }}></div>
          </div>
        </div>
        <div className="MergerCC">
          <div className="abilityLeft">SPE</div>
          <div className="slider" onChange={(e) => SPEValue}
          style={{width: "65%" }}>
            <div className="barValue" style={{ width: `${SPEValue}%` }}></div>
          </div>
        </div>
      </div>

    </div>
  );
}
//old Ability Chart
/*{Object.entries(stats).map(([stat, value]) => (
 < *div key={stat} className="ability-row">
 <p>{stat}</p>
 <input
 type="range"
 min="0"
 max="100"
 value={value}
 onChange={(e) => handleStatChange(stat, e.target.value)}
 className="slider"
 style={{ "--val": `${value}%`, width: "65%" }}/>
 </div>
 ))}*/

export default CharacterCard;
