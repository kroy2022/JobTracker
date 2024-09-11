import { useState, useEffect } from "react";
import { getFirestore, collection, addDoc, getDocs, DocumentData } from "firebase/firestore";
import firebaseConfig from './keys';
import { initializeApp } from "firebase/app";
import { link } from "fs";
import "./main.css"; 

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface JobSkeleton {
  jobId: string,
  info: DocumentData
}

console.log(firebaseConfig);
console.log(app);
console.log(db);

function App() {
  const [isApplication, setIsApplication] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [url, setUrl] = useState('');
  const [jobApplications, setJobApplications] = useState<Array<JobSkeleton>>([]);
  const [showApplications, setShowApplications] = useState(false);
  const [checkIfApplication, setCheckIfApplication] = useState(false);

  useEffect(() => {
    const innerHtml = document.documentElement.innerHTML.toLowerCase();
    const currentUrl = window.location.href;
    console.log("URL: ", currentUrl);

    const title = currentUrl.split("/").pop()!.toLowerCase();
    console.log("job title: ", title);

    if (title.includes("intern") && innerHtml.includes("apply")) {
      console.log("YESSSSS JOB APPLICATION");
      setJobTitle(title);
      setUrl(currentUrl);
      setIsApplication(true);
    } 
     else if (innerHtml.includes("apply")) {
      console.log(innerHtml.indexOf("apply"));
      console.log("maybe job application");
      setCheckIfApplication(true);
    } 
    else {
      console.log("not job application");
    }
  }, [])

  useEffect(() => {
    console.log("is application use effect: ", isApplication);
  }, [isApplication])

  const addJobApplication = async () => {
    console.log("job title: ", jobTitle);
    console.log("URL: ", url);
    
    try {
      const doc = await addDoc(collection(db, "jobApplications"), {
        Job_Title: jobTitle,
        Link: url,
        Date: new Date().toISOString(),
        Status: "Applied"
      });
      console.log("Document Written with ID: ", doc.id);
    } catch (e) {
      console.error("Error adding doc: ", e);
    }
  }

  const seeJobApplications = async () => {
    const data = await getDocs(collection(db, "jobApplications"));
    console.log("All db columns: ", data);

    let tempApps: JobSkeleton[] = [];
    
    data.forEach((doc) => {
      const jobObj = {
        jobId: doc.id,
        info: doc.data()
      };
      tempApps.push(jobObj);
    });

    setJobApplications(tempApps);
    setShowApplications(true);
  }

  const changeTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setJobTitle(event.target.value);
  }

  const changeApplication = () => {
    setIsApplication(!isApplication);
  }

  const changeIfApplication = () => {
    setCheckIfApplication(!checkIfApplication);
  }

  useEffect(() => {
    if (checkIfApplication) {
    }
  }, [checkIfApplication]);

  if (checkIfApplication) {
    return (
      <div className="container show">
        <h1 className="title-h">Is this an application?</h1>
          <button className="btn" onClick={() => {
            changeIfApplication();
            changeApplication();
          }}>Yes</button>
          <button className="btn" onClick={changeIfApplication}>No</button>
      </div>
    )
  }

  return (
    <div className={`container ${isApplication ? 'show' : ''}`}>
      {showApplications ? (
        <div className="job-info-div">
          {jobApplications.map((application) => (
            <div className="application">
              <p className="job">ID: {application.jobId}</p>
              <p className="job">Job Title: {application.info.Job_Title}</p>
              <p className="job">Link: <a href={application.info.Link} target="_blank" rel="noopener noreferrer">Job Link</a></p>
              <p className="job">Date: {application.info.Date}</p>
              <p className="job">Status: {application.info.Status}</p>
            </div>
          ))}
          <button className="btn" onClick={changeApplication}>Close</button>
        </div>
      ) : (
        <div className="job-info-div">
          <h1 className="title-h">Job Title:</h1>
          <input className="title-i" value={jobTitle} onChange={changeTitle}/>
          <button className="btn" onClick={addJobApplication}>Add Job</button>
          <button className="btn" onClick={seeJobApplications}>See Applied Jobs</button>
          <button className="btn" onClick={changeApplication}>Close</button>
        </div> 
      )}
    </div>
  );
}

export default App;
