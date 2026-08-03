import {
  Building2,
  CalendarDays,
  CircleDollarSign,
  Search,
  UserRound,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import "./GlobalSearch.css";

const readStoredArray = (key) => {
  const savedData = localStorage.getItem(key);

  if (!savedData) {
    return [];
  }

  try {
    const parsedData = JSON.parse(savedData);

    return Array.isArray(parsedData) ? parsedData : [];
  } catch {
    return [];
  }
};

function GlobalSearch() {
  const navigate = useNavigate();
  const searchContainerRef = useRef(null);
  const inputRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeResultIndex, setActiveResultIndex] =
    useState(-1);

  const contacts = useMemo(
    () => readStoredArray("flowcrm-contacts"),
    []
  );

  const companies = useMemo(
    () => readStoredArray("flowcrm-companies"),
    []
  );

  const deals = useMemo(
    () => readStoredArray("flowcrm-deals"),
    []
  );

  const tasks = useMemo(
    () => readStoredArray("flowcrm-tasks"),
    []
  );

  const normalizedSearch = searchTerm
    .trim()
    .toLowerCase();

  const results = useMemo(() => {
    if (!normalizedSearch) {
      return [];
    }

    const contactResults = contacts
      .filter((contact) => {
        const searchableText = [
          contact.name,
          contact.email,
          contact.company,
          contact.phone,
          contact.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(normalizedSearch);
      })
      .map((contact) => ({
        id: `contact-${contact.id}`,
        type: "Contact",
        title: contact.name,
        subtitle:
          contact.email ||
          contact.company ||
          "CRM contact",
        route: `/contacts/${contact.id}`,
        icon: UserRound,
      }));

    const companyResults = companies
      .filter((company) => {
        const searchableText = [
          company.name,
          company.industry,
          company.location,
          company.status,
          company.website,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(normalizedSearch);
      })
      .map((company) => ({
        id: `company-${company.id}`,
        type: "Company",
        title: company.name,
        subtitle:
          company.industry ||
          company.location ||
          "CRM company",
        route: `/companies/${company.id}`,
        icon: Building2,
      }));

    const dealResults = deals
      .filter((deal) => {
        const searchableText = [
          deal.title,
          deal.company,
          deal.contact,
          deal.stage,
          deal.owner,
          deal.priority,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(normalizedSearch);
      })
      .map((deal) => ({
        id: `deal-${deal.id}`,
        type: "Deal",
        title: deal.title,
        subtitle: `${deal.company || "No company"} · ${
          deal.stage || "Lead"
        }`,
        route: `/deals/${deal.id}`,
        icon: CircleDollarSign,
      }));

    const taskResults = tasks
      .filter((task) => {
        const searchableText = [
          task.title,
          task.description,
          task.status,
          task.priority,
          task.relatedName,
          task.relatedTo,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(normalizedSearch);
      })
      .map((task) => ({
        id: `task-${task.id}`,
        type: "Task",
        title: task.title,
        subtitle:
          task.relatedName ||
          task.relatedTo ||
          task.status ||
          "CRM task",
        route: "/tasks",
        icon: CalendarDays,
      }));

    return [
      ...contactResults,
      ...companyResults,
      ...dealResults,
      ...taskResults,
    ].slice(0, 12);
  }, [
    contacts,
    companies,
    deals,
    tasks,
    normalizedSearch,
  ]);

  useEffect(() => {
    setActiveResultIndex(-1);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(
          event.target
        )
      ) {
        setIsOpen(false);
        setActiveResultIndex(-1);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  useEffect(() => {
    const handleGlobalShortcut = (event) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    document.addEventListener(
      "keydown",
      handleGlobalShortcut
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleGlobalShortcut
      );
    };
  }, []);

  const openResult = (result) => {
    navigate(result.route);
    setSearchTerm("");
    setIsOpen(false);
    setActiveResultIndex(-1);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      setActiveResultIndex(-1);
      inputRef.current?.blur();
      return;
    }

    if (!isOpen || results.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      setActiveResultIndex((currentIndex) =>
        currentIndex >= results.length - 1
          ? 0
          : currentIndex + 1
      );

      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setActiveResultIndex((currentIndex) =>
        currentIndex <= 0
          ? results.length - 1
          : currentIndex - 1
      );

      return;
    }

    if (
      event.key === "Enter" &&
      activeResultIndex >= 0
    ) {
      event.preventDefault();
      openResult(results[activeResultIndex]);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setActiveResultIndex(-1);
    inputRef.current?.focus();
  };
  return (
    <div
      className="global-search"
      ref={searchContainerRef}
    >
      <div
        className={`global-search__input-wrapper ${
          isOpen
            ? "global-search__input-wrapper--open"
            : ""
        }`}
      >
        <Search size={18} />

        <input
          ref={inputRef}
          type="text"
          placeholder="Search contacts, companies, deals, or tasks..."
          value={searchTerm}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            setSearchTerm(event.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          aria-label="Global CRM search"
          aria-expanded={isOpen}
          aria-controls="global-search-results"
        />

        {searchTerm ? (
          <button
            type="button"
            className="global-search__clear"
            aria-label="Clear search"
            onClick={clearSearch}
          >
            <X size={16} />
          </button>
        ) : (
          <span className="global-search__shortcut">
            Ctrl K
          </span>
        )}
      </div>

      {isOpen && (
        <div
          className="global-search__dropdown"
          id="global-search-results"
        >
          {!normalizedSearch ? (
            <div className="global-search__empty">
              <Search size={26} />

              <p>Search your CRM</p>

              <span>
                Find contacts, companies, deals, and
                tasks.
              </span>
            </div>
          ) : results.length === 0 ? (
            <div className="global-search__empty">
              <Search size={26} />

              <p>No results found</p>

              <span>
                Try another name, company, email, stage,
                or task.
              </span>
            </div>
          ) : (
            <>
              <div className="global-search__results-header">
                <span>
                  {results.length}{" "}
                  {results.length === 1
                    ? "result"
                    : "results"}
                </span>

                <small>
                  Use ↑ ↓ and Enter
                </small>
              </div>

              <div className="global-search__results">
                {results.map((result, index) => {
                  const Icon = result.icon;

                  return (
                    <button
                      type="button"
                      className={`global-search__result ${
                        activeResultIndex === index
                          ? "global-search__result--active"
                          : ""
                      }`}
                      key={result.id}
                      onMouseEnter={() =>
                        setActiveResultIndex(index)
                      }
                      onClick={() => openResult(result)}
                    >
                      <div className="global-search__result-icon">
                        <Icon size={18} />
                      </div>

                      <div className="global-search__result-content">
                        <div>
                          <strong>{result.title}</strong>

                          <span>
                            {result.type}
                          </span>
                        </div>

                        <p>{result.subtitle}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="global-search__footer">
                <span>
                  <kbd>Esc</kbd>
                  Close
                </span>

                <span>
                  <kbd>Enter</kbd>
                  Open
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default GlobalSearch;