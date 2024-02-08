import { useEffect, useState } from "react";
//import db from './temp'
import "./style.css";

function App() {
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(0);

  useEffect(
    function () {
      async function getFacts() {
        setIsLoading(true);

        await fetch(`/facts/${currentCategory}`)
          .then((response) => response.json())
          .then((data) => setFacts(data))
          .catch((error) => {
            alert("There was a problem getting data");
            console.error("Error in getting facts: ", error);
          });

        setIsLoading(false);
      }
      getFacts();
    },
    [currentCategory]
  );

  return (
    <>
      <Header showForm={showForm} setShowForm={setShowForm} />

      {showForm ? (
        <NewFactForm setFacts={setFacts} setShowForm={setShowForm} />
      ) : null}

      <main className="main">
        <CategoryFilter
          setCurrentCategory={setCurrentCategory}
          setIsLoading={setIsLoading}
        />
        {isLoading ? (
          <Loader />
        ) : (
          <FactList facts={facts} setFacts={setFacts} />
        )}
      </main>
    </>
  );
}

function Loader() {
  return <p className="message">Loading...</p>;
}

function Header({ showForm, setShowForm }) {
  return (
    <header className="header">
      <div className="logo">
        <img src="logo.png" alt="Today I Learned Logo" />
        <h1>Today I Learned</h1>
      </div>
      <button
        className="btn btn-large btn-open"
        onClick={() => setShowForm((show) => !show)}
      >
        {showForm ? "Close" : "Share a fact"}
      </button>
    </header>
  );
}

function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

function NewFactForm({ setFacts, setShowForm }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("https://example.com");
  const [category, setCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [categoriesList, setCategoriesList] = useState([]);

  useEffect(function () {
    async function getCategories() {
      fetch("/categories")
        .then((response) => response.json())
        .then((data) => setCategoriesList(data))
        .catch((error) => {
          console.error("Error in getting catefories: ", error);
        });
    }
    getCategories();
  }, []);

  const textLength = text.length;

  async function handleSubmit(e) {
    e.preventDefault();

    if (text && isValidHttpUrl(source) && category && textLength <= 200) {
      setIsUploading(true);

      const newFact = {
        fact_content: text,
        link_source: source,
        categoryId: category,
      };

      await fetch("/facts/postNewFact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newFact),
      })
        .then((response) => response.json())
        .then((result) => {
          setFacts((facts) => [result[0], ...facts]);
        })
        .catch((error) => {
          alert("There was a problem posting newFact");
          console.error("Error:", error);
        });

      setIsUploading(false);

      setText("");
      setSource("");
      setCategory("");

      setShowForm(false);
    }
  }

  return (
    <form className="fact-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Share a fact with the world..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <span>{200 - textLength}</span>
      <input
        type="text"
        placeholder="Trustworthy source..."
        value={source}
        onChange={(e) => setSource(e.target.value)}
        disabled={isUploading}
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        disabled={isUploading}
      >
        <option value="">Choose category:</option>
        {categoriesList.map((cat) => (
          <option key={cat.cat_name} value={cat.id}>
            {cat.cat_name.toUpperCase()}
          </option>
        ))}
      </select>
      <button className="btn btn-large" disabled={isUploading}>
        Post
      </button>
    </form>
  );
}

function CategoryFilter({ setCurrentCategory }) {
  const [categories, setCategories] = useState([]);

  useEffect(function () {
    async function getCategories() {
      fetch("/categories")
        .then((response) => response.json())
        .then((data) => setCategories(data))
        .catch((error) => {
          console.error("Error in getting catefories: ", error);
        });
    }
    getCategories();
  }, []);

  return (
    <aside>
      <ul>
        <li className="category">
          <button
            className="btn btn-all-categories"
            onClick={() => setCurrentCategory(0)}
          >
            All
          </button>
        </li>
        {categories.map((cat) => (
          <li key={`${cat.id}`} className="category">
            <button
              className="btn btn-category"
              style={{ backgroundColor: `#${cat.color}` }}
              onClick={() => setCurrentCategory(cat.id)}
            >
              {`${cat.cat_name}`}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function FactList({ facts, setFacts }) {
  if (facts.length === 0) {
    return (
      <p className="message">
        No facts for this category yet! Create the first one
      </p>
    );
  }

  return (
    <section>
      <ul className="facts-list">
        {facts.map((fact) => (
          <Fact key={fact.id} fact={fact} setFacts={setFacts} />
        ))}
      </ul>
      <p>There are {facts.length} in the database. Add your own!</p>
    </section>
  );
}

function Fact({ fact, setFacts }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const isDisputed =
    fact.votesInteresting + fact.votesMindblowing < fact.votesFalse;

  async function HandleVote(columnName, factId) {
    setIsUpdating(true);

    await fetch(`/updateVote/${factId}/${columnName}`, {
      method: "PUT",
    })
      .then((response) => response.json())
      .then((result) => {
        setFacts((facts) => facts.map((f) => (f.id == factId ? result[0] : f)));
      })
      .catch((error) => {
        alert("There was a problem updating vote");
        console.error("Error:", error);
      });

    setIsUpdating(false);
  }

  return (
    <li className="fact">
      <p>
        {isDisputed ? <span className="disputed">[DISPUTED]</span> : null}
        {fact.fact_content}
        <a className="source" href={fact.link_source} target="_blank">
          (Source)
        </a>
      </p>
      <span
        className="tag"
        style={{
          backgroundColor: `#${fact.color}`,
        }}
      >
        {fact.cat_name}
      </span>
      <div className="vote-buttons">
        <button
          onClick={() => HandleVote("votesInteresting", fact.id)}
          disabled={isUpdating}
        >
          👍 {fact.votesInteresting}
        </button>
        <button
          onClick={() => HandleVote("votesMindblowing", fact.id)}
          disabled={isUpdating}
        >
          🤯 {fact.votesMindblowing}
        </button>
        <button
          onClick={() => HandleVote("votesFalse", fact.id)}
          disabled={isUpdating}
        >
          ⛔️ {fact.votesFalse}
        </button>
      </div>
    </li>
  );
}

export default App;
