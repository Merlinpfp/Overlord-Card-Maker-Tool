import './App.css';
import { useState } from 'react';
import racesData from './data/overlord_race.json';
import jobData from './data/overlord_job_classes.json';
import CharacterCard from "./CharacterCard";
import html2canvas from "html2canvas";
import React, { useRef } from "react";

function checkRequirements(classObj, classPoints)
{
  if (!classObj.requires || classObj.requires.length === 0) return true;
  return classObj.requires.every(req =>
  {
    const spent = classPoints[req.class] || 0;
    return spent >= req.points;
  });
}

//console.log(JSON.stringify(racesData, null, 2));

function App()
{
  const [name, setName] = useState('');
  const [level, setLevel] = useState(1);
  const [Karma, setKarma] = useState(0);
  const [raceFilter, setRaceFilter] = useState('');
  const [selectedRace, setSelectedRace] = useState('');
  const [secondaryRaces, setSecondaryRaces] = useState([]);
  const [classPoints, setClassPoints] = useState({});
  const [jobClassPoints, setJobClassPoints] = useState({});

  const [HPValue, setHPValue] = useState(0);
  const [MPValue, setMPValue] = useState(0);
  const [PATKValue, setPATKValue] = useState(0);
  const [PDEFValue, setPDEFValue] = useState(0);
  const [MATKValue, setMATKValue] = useState(0);
  const [MDEFValue, setMDEFValue] = useState(0);
  const [AGIValue, setAGIValue] = useState(0);
  const [RESValue, setRESValue] = useState(0);
  const [SPEValue, setSPEValue] = useState(0);

  const [uploadedImage, setUploadedImage] = useState(null);
  const [ImgError, setImgError] = useState("");

  const MagicSources = ["Arcane","Divine","Spiritual","Alternative"];
  const CharMagicSource = [];
  const CharSkills = [];

  const cardRef = useRef(null);

  const handleDownload = async () =>
  {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current,
    {
      backgroundColor: null,
      //scale: 2
    });
    const link = document.createElement("a");
    link.download = `${name || "character-card"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleImageUpload = (event) =>
  {
    const file = event.target.files[0];

    if (file)
    {
      setImgError("");

      if (file.type !== "image/png" && file.type !== "image/jpeg")
      {
        setImgError("only files of type PNG or JPG allowed!");
        return;
      }

      const maxSize = 2 * 2048 * 2048; // 4MB
      if (file.size > maxSize)
      {
        setImgError("Max 4MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () =>
      {
        setUploadedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }

  //
  const getCombinedIncompatibilities = () =>
  {
    let incompat = new Set();
    if (selectedRace && racesData[selectedRace])
    {
      racesData[selectedRace].incompatibleWith.forEach(r => incompat.add(r));
    }
    secondaryRaces.forEach(race =>
    {
      if (racesData[race])
      {
        racesData[race].incompatibleWith.forEach(r => incompat.add(r));
      }
    });
    return incompat;
  };

  const combinedIncompat = getCombinedIncompatibilities();

  const filteredRaces = Object.keys(racesData).filter(race =>
  {
    const passesTextFilter = race.toLowerCase().includes(raceFilter.toLowerCase());
    const notSelected = race !== selectedRace && !secondaryRaces.includes(race);
    const compatible = !combinedIncompat.has(race);

    //console.log(race, { passesTextFilter, notSelected, compatible });

    return passesTextFilter && notSelected && compatible;
  });

  const handleRaceClick = (race) =>
  {
    if (!selectedRace)
    {
      setSelectedRace(race);
    } else if (selectedRace === race)
    {
      setSelectedRace('');
      setSecondaryRaces([]);
      setClassPoints({});
    } else
    {
      if (secondaryRaces.includes(race))
      {
        setSecondaryRaces(secondaryRaces.filter(r => r !== race));
        const updated = { ...classPoints };
        racesData[race].classes.forEach(c => delete updated[c.name]);
        setClassPoints(updated);
      } else
      {
        setSecondaryRaces([...secondaryRaces, race]);
      }
    }
  };

  //
  const getCompatibleJobClasses = () =>
  {
    if (!jobData.Categories) return [];

    const allJobs = [];

    Object.entries(jobData.Categories).forEach(([category, jobs]) =>
    {
      jobs.forEach((job) =>
      {
        const isIncompatibleWithRace = chosenRaces.some((race) =>
        job.incompatibleWith.includes(race)
        );

        const isIncompatibleWithJob = Object.keys(jobClassPoints).some((jc) =>
        job.incompatibleWith.includes(jc)
        );

        const isIncompatibleWithMagic = CharMagicSource.some((src) =>
        job.incompatibleWith.includes(src)
        );

        const requiresMet = (job.requires || []).every((req) =>
        {
          const pointsInRequiredClass =
          classPoints[req.class] || jobClassPoints[req.class] || 0;
          return pointsInRequiredClass >= req.points;
        });

        if ( !isIncompatibleWithRace && !isIncompatibleWithJob && !isIncompatibleWithMagic && requiresMet )
        {
          allJobs.push({ category, ...job });

          const investedPoints = jobClassPoints[job.name] || 0;
          if (investedPoints > 0)
          {
            if (job.AddsMagicSource)
            {
              job.AddsMagicSource.forEach((src) =>
              {
                if (!CharMagicSource.includes(src))
                {
                  CharMagicSource.push(src);
                }
              });
            }

            if (job.AddSkills)
            {
              job.AddSkills.forEach((skill) =>
              {
                if (!CharSkills.includes(skill))
                {
                  CharSkills.push(skill);
                }
              });
            }
          }

        }
      });
    });

    return allJobs;
  };

  const handleJobClassPointsChange = (className, value) =>
  {
    setJobClassPoints((prev) =>
      ({
        ...prev,
        [className]: Math.max(0, parseInt(value) || 0)
      }));
  };

  //
  const chosenRaces = [selectedRace, ...secondaryRaces].filter(r => r && !combinedIncompat.has(r));

  chosenRaces.forEach(race =>
  {
    racesData[race].classes.forEach(cls =>
    {
      const enabled = checkRequirements(cls, classPoints);
      const investedPoints = classPoints[cls.name] || 0;

      //console.log(cls.name + " " + investedPoints);
      if (enabled && investedPoints > 0)
      {
        // Skills hinzufügen
        if (cls.AddSkills)
        {
          cls.AddSkills.forEach(skill =>
          {
            if (!CharSkills.includes(skill))
            {
              CharSkills.push(skill);
            }
          });
        }
        // Magiequellen hinzufügen
        if (cls.AddsMagicSource)
        {
          cls.AddsMagicSource.forEach(src =>
          {
            if (!CharMagicSource.includes(src))
            {
              CharMagicSource.push(src);
            }
          });
        }
      }
    });
  });
  //
  const jobPointsUsed = Object.values(jobClassPoints).reduce((sum, pts) => sum + pts, 0);

  const racePointsUsed = chosenRaces.reduce((total, race) =>
  {
    return total + racesData[race].classes.reduce((raceSum, cls) =>
    {
      const enabled = checkRequirements(cls, classPoints);
      return raceSum + (enabled ? (classPoints[cls.name] || 0) : 0);
    }, 0);
  }, 0);

  const pointsUsed = racePointsUsed + jobPointsUsed;
  const pointsLeft = level - pointsUsed;

  //
  const [selectedSkills, setSelectedSkills] = useState([]);

  const handleSkillClick = (skill) =>
  {
    if (selectedSkills.includes(skill))
    {
      // Entfernen, wenn bereits ausgewählt
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      // Nur hinzufügen, wenn weniger als 4 ausgewählt
      if (selectedSkills.length < 4) {
        setSelectedSkills([...selectedSkills, skill]);
      }
    }
  };
  //
  const [ASactive, ASsetActive] = useState(0);
  const [MSactive, MSsetActive] = useState(0);

  //----------------------------------------------------------------------------------------------------------------
  return (
    <div>
      <header className="App-header">
        <u>Welcome to Overlord Card Maker App</u>
      </header>

      <div className="Textbox">
        <p>with this Card Maker you can create your own Overlord Characters.</p>
        <p>simply select what you want to add.</p>
      </div>

      <div className="NewCardField">
        <div className="Merger">
          <div>Character Name:</div>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{marginLeft: "15px"}} className="Cardinput"></input>
        </div>
        <div className="Merger">
          <div>Level (1–100):</div>
          <input type="number" min={1} max={100} value={level} onChange={(e) =>
            {
              let val = parseInt(e.target.value) || 1;
              if (val > 100) val = 100;
              if (val < 1) val = 1;
              setLevel(val);
            }} style={{marginLeft: "15px"}} className="Cardinput"></input>
        </div>
        <div className="Merger">
          <div>Race:</div>
          <input type="text" value={raceFilter} onChange={(e) => setRaceFilter(e.target.value)} style={{marginLeft: "15px"}} className="Cardinput"></input>
        </div>
        <div className="Merger">
          <div>Karma Value:</div>
          <input type="text" value={Karma} onChange={(e) =>
            {
              const val = e.target.value;

              if (val === "" || val === "-") {
                setKarma(val);
                return;
              }

              let num = parseInt(val, 10);
              if (isNaN(num)) return;

              if (num > 500) num = 500;
              if (num < -500) num = -500;

              setKarma(num.toString());
            }}
            onBlur={() =>
              {
              if (Karma === "" || Karma === "-")
              {
                setKarma("0");
              }
            }} style={{marginLeft: "15px"}} className="Cardinput"></input>
        </div>

    <table className="RaceTable" style={{ width: '80%', borderCollapse: 'collapse', color: 'white' }}>
    <tbody>
    { selectedRace && (
      <tr
      key={selectedRace}
      onClick={() => handleRaceClick(selectedRace)}
      style={{
        borderBottom: '1px solid #555',
        cursor: 'pointer',
        backgroundColor: '#222'
      }}
      >
      <td style={{ padding: '8px', color: 'gold' }}>
      {selectedRace} (primary)
      </td>
      </tr>
    )}

    {secondaryRaces.map(race => (
      <tr
      key={race}
      onClick={() => handleRaceClick(race)}
      style={{
        borderBottom: '1px solid #555',
        cursor: 'pointer',
        backgroundColor: '#222'
      }}
      >
      <td style={{ padding: '8px', color: 'aqua' }}>
      {race} (secondary)
      </td>
      </tr>
    ))}

    {filteredRaces.map(race => (
      <tr
      key={race}
      onClick={() => handleRaceClick(race)}
      style={{ borderBottom: '1px solid #555', cursor: 'pointer' }}
      >
      <td style={{ padding: '8px' }}>{race}</td>
      </tr>
    ))}
    </tbody>
    </table>

    </div>

    {chosenRaces.length > 0 && (
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ color: '#f5deb3' }}>
          Use Level points for your Race Classes ({level} Points,{' '}
          <span style={{ color: pointsLeft < 0 ? 'red' : '#f5deb3' }}>
            {pointsLeft} Points left
          </span>)
        </h3>

      <table className="RaceClassTable" style={{ width: '100%', color: 'white', borderCollapse: 'collapse' }}>
      <thead>
      <tr>
      <th style={{ borderBottom: '1px solid #555' }}>Race</th>
      <th style={{ borderBottom: '1px solid #555' }}>Class</th>
      <th style={{ borderBottom: '1px solid #555' }}>Points</th>
      <th style={{ borderBottom: '1px solid #555' }}>Rarity</th>
      </tr>
      </thead>
      <tbody>
      {chosenRaces.map(race =>
      (
        racesData[race].classes.map(cls =>
        {
          const enabled = checkRequirements(cls, classPoints);
          return (
            <tr key={`${race}-${cls.name}`}>
            <td style={{ padding: '4px' }}>{race}</td>
            <td style={{ padding: '4px' }}>{cls.name}</td>
            <td style={{ padding: '4px' }}>
            <input
            type="number"
            min="0"
            max={cls.maxPoints}
            disabled={!enabled}
            value={classPoints[cls.name] || 0}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 0;
              setClassPoints({
                ...classPoints,
                [cls.name]: val
              });
            }}
            style={{ width: '60px' }}
            />
            </td>
            <td style={{ padding: '4px' }}>{cls.ClassRarity}</td>
            </tr>
          );
        })
      ))}
      </tbody>
      </table>

        <h3 style={{ color: '#f5deb3' }}>
          JobClasses
        </h3>

        <table className="JobClassTable">
          <thead>
            <tr>
              <th>Category</th>
              <th>Class</th>
              <th>Points</th>
              <th>Requires</th>
            </tr>
          </thead>
          <tbody>
            {getCompatibleJobClasses().map((job) => (
              <tr key={job.name}>
                <td>{job.category}</td>
                <td>{job.name}</td>
                <td>
                  <input type="number" min="0" max={job.maxPoints} value={jobClassPoints[job.name] || 0}
                  onChange={(e) => handleJobClassPointsChange(job.name, e.target.value)} style={{ width: '60px' }}/>
                </td>
                <td>
                  {job.requires?.map((r) => `${r.class} (${r.points})`).join(', ') || '-'}
                </td>
            </tr>
          ))}
          </tbody>
        </table>

        <h3 style={{ color: '#f5deb3' }}>Available Skills</h3>
        <table className="SkillTable">
          <thead>
            <tr>
              <th style={{ width: "50%" }}>Skill</th>
              <th style={{ width: "50%" }}>Status</th>
            </tr>
          </thead>
            <tbody>
            {CharSkills.map((skill) =>
              (
                <tr
                key={skill}
                onClick={() => handleSkillClick(skill)}
                style={{
                  cursor: "pointer",
                  color: selectedSkills.includes(skill) ? "aqua" : "white"
                }}
                >
                <td>{skill}</td>
                <td>{selectedSkills.includes(skill) ? "Selected" : "-"}</td>
                </tr>
              ))}
            </tbody>
        </table>

        <div className="App" style={{ padding: "20px", color: "white" }}>
        <h2 style={{ color: '#f5deb3' }}>Upload Character Image</h2>
        <label className="ImageInput">
          <input style={{ display: "none" }} type="file" accept="image/png, image/jpeg" onChange={handleImageUpload}/>
          Choose file
        </label>

        {/* show error #f5deb3 */}
        {ImgError && (
          <p style={{ color: "red", marginTop: "10px" }}>
          ⚠️ {ImgError}
          </p>
        )}

        {/* Vorschau anzeigen */}

        {/*
        {uploadedImage && (
          <div style={{ marginTop: "20px" }}>
          <h3>Preview:</h3>
          <img
          src={uploadedImage}
          alt="Character Preview"
          style={{
            maxWidth: "300px",
            maxHeight: "300px",
            border: "2px solid #f5deb3",
            borderRadius: "8px",
            boxShadow: "#f5deb3 0px 0px 8px"
          }}
          />
          </div>
        )}
        */}
        </div>

        <div className="StatsValues">
          <h2 style={{ color: '#f5deb3' }}>Add Stats</h2>
          <div className="Merger">
            <div style={{ marginRight: "15px" }}>HP Value:</div>
            <input type="number" min={0} max={100} value={HPValue} onChange={(e) =>
              {
                let val = parseInt(e.target.value) || 0;
                if (val > 100) val = 100;
                if (val < 0) val = 0;
                setHPValue(val);
              }} className="Cardinput"></input>
          </div>
          <div className="Merger">
            <div style={{ marginRight: "15px" }}>MP Value:</div>
            <input type="number" min={0} max={100} value={MPValue} onChange={(e) =>
              {
                let val = parseInt(e.target.value) || 0;
                if (val > 100) val = 100;
                if (val < 0) val = 0;
                setMPValue(val);
              }} className="Cardinput"></input>
          </div>
          <div className="Merger">
            <div style={{ marginRight: "15px" }}>PHY.ATK Value:</div>
            <input type="number" min={0} max={100} value={PATKValue} onChange={(e) =>
              {
                let val = parseInt(e.target.value) || 0;
                if (val > 100) val = 100;
                if (val < 0) val = 0;
                setPATKValue(val);
              }} className="Cardinput"></input>
          </div>
          <div className="Merger">
            <div style={{ marginRight: "15px" }}>PHY.DEF Value:</div>
            <input type="number" min={0} max={100} value={PDEFValue} onChange={(e) =>
              {
                let val = parseInt(e.target.value) || 0;
                if (val > 100) val = 100;
                if (val < 0) val = 0;
                setPDEFValue(val);
              }} className="Cardinput"></input>
          </div>
          <div className="Merger">
            <div style={{ marginRight: "15px" }}>MAG.ATK Value:</div>
            <input type="number" min={0} max={100} value={MATKValue} onChange={(e) =>
              {
                let val = parseInt(e.target.value) || 0;
                if (val > 100) val = 100;
                if (val < 0) val = 0;
                setMATKValue(val);
              }} className="Cardinput"></input>
          </div>
          <div className="Merger">
            <div style={{ marginRight: "15px" }}>MAG.DEF Value:</div>
            <input type="number" min={0} max={100} value={MDEFValue} onChange={(e) =>
              {
                let val = parseInt(e.target.value) || 0;
                if (val > 100) val = 100;
                if (val < 0) val = 0;
                setMDEFValue(val);
              }} className="Cardinput"></input>
          </div>
          <div className="Merger">
            <div style={{ marginRight: "15px" }}>AGILITY Value:</div>
            <input type="number" min={0} max={100} value={AGIValue} onChange={(e) =>
              {
                let val = parseInt(e.target.value) || 0;
                if (val > 100) val = 100;
                if (val < 0) val = 0;
                setAGIValue(val);
              }} className="Cardinput"></input>
          </div>
          <div className="Merger">
            <div style={{ marginRight: "15px" }}>RES Value:</div>
            <input type="number" min={0} max={100} value={RESValue} onChange={(e) =>
              {
                let val = parseInt(e.target.value) || 0;
                if (val > 100) val = 100;
                if (val < 0) val = 0;
                setRESValue(val);
              }} className="Cardinput"></input>
          </div>
          <div className="Merger">
            <div style={{ marginRight: "15px" }}>SPE Value:</div>
            <input type="number" min={0} max={100} value={SPEValue} onChange={(e) =>
              {
                let val = parseInt(e.target.value) || 0;
                if (val > 100) val = 100;
                if (val < 0) val = 0;
                setSPEValue(val);
              }} className="Cardinput"></input>
          </div>
        </div>

        <div ref={cardRef}>
          <CharacterCard
            name={name}
            level={level}
            image={uploadedImage}
            charMagicSource={CharMagicSource}
            races={chosenRaces}

            raceClasses={Object.entries(classPoints)
              .filter(([cls, pts]) => pts > 0)
              .map(([cls, pts]) => ({ name: cls, points: pts }))}

            jobClasses={Object.entries(jobClassPoints)
              .filter(([cls, pts]) => pts > 0)
              .map(([cls, pts]) => ({ name: cls, points: pts }))}

            skills={selectedSkills}
            senseOfJustice={Karma}
            raceClassPoints={classPoints}
            jobClassPoints={jobClassPoints}

            ASactive={ASactive}
            MSactive={MSactive}

            HPValue={HPValue}
            MPValue={MPValue}
            PATKValue={PATKValue}
            PDEFValue={PDEFValue}
            MATKValue={MATKValue}
            MDEFValue={MDEFValue}
            AGIValue={AGIValue}
            RESValue={RESValue}
            SPEValue={SPEValue}
          />
        </div>

        <button className="DownloadButton" onClick={handleDownload}>Download Your Card</button>

        <div className="DotoContainer">
          <p className="DotoText">Add Stars:</p>
          <div className="DotoRight">
            <span className={ASactive === 0 ? "Doto Doto--Selected" : "Doto"} onClick={() => ASsetActive(0)}>●</span>
            <span className={ASactive === 1 ? "Doto Doto--Selected" : "Doto"} onClick={() => ASsetActive(1)}>●</span>
          </div>
        </div>

        <div className="DotoContainer">
          <p className="DotoText">Show Magic Source:</p>
          <div className="DotoRight">
            <span className={MSactive === 0 ? "Doto Doto--Selected" : "Doto"} onClick={() => MSsetActive(0)}>●</span>
            <span className={MSactive === 1 ? "Doto Doto--Selected" : "Doto"} onClick={() => MSsetActive(1)}>●</span>
          </div>
        </div>

      </div>
    )}//choosen Races

      <footer className="footline">
        <div className="above-footer"></div>
        <a href="/legal.html">Legal Notice</a>
      </footer>
    </div>
  );
}

export default App;
