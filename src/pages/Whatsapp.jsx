import {
  CheckCheck,
  ChevronLeft,
  Clock3,
  MessageCircle,
  MoreVertical,
  Paperclip,
  Search,
  Send,
  Smile,
  UserRound,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useToast } from "../components/ToastProvider.jsx";
import "./WhatsApp.css";

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

const fallbackContacts = [
  {
    id: 1,
    name: "Sarah Johnson",
    company: "Bright Labs",
    phone: "+1 202 555 0147",
    status: "Lead",
  },
  {
    id: 2,
    name: "James Miller",
    company: "Northstar",
    phone: "+1 202 555 0182",
    status: "Customer",
  },
  {
    id: 3,
    name: "Anna Lopez",
    company: "GreenTech",
    phone: "+57 310 555 0188",
    status: "Prospect",
  },
  {
    id: 4,
    name: "Michael Chen",
    company: "Apex Systems",
    phone: "+1 202 555 0129",
    status: "Customer",
  },
];

const initialMessages = {
  1: [
    {
      id: 101,
      sender: "contact",
      text: "Hi Juan, thanks for sending the CRM proposal.",
      timestamp: "2026-08-03T14:15:00",
      status: "read",
    },
    {
      id: 102,
      sender: "user",
      text: "You're welcome. Let me know if you have any questions about the automation package.",
      timestamp: "2026-08-03T14:18:00",
      status: "read",
    },
    {
      id: 103,
      sender: "contact",
      text: "Can we schedule a short call tomorrow afternoon?",
      timestamp: "2026-08-03T14:22:00",
      status: "read",
    },
  ],
  2: [
    {
      id: 201,
      sender: "user",
      text: "Hi James, the WhatsApp integration demo is ready.",
      timestamp: "2026-08-02T10:30:00",
      status: "read",
    },
    {
      id: 202,
      sender: "contact",
      text: "Perfect. Please send me the available times.",
      timestamp: "2026-08-02T10:41:00",
      status: "read",
    },
  ],
  3: [
    {
      id: 301,
      sender: "contact",
      text: "Could you send the updated customer-support proposal?",
      timestamp: "2026-08-01T09:15:00",
      status: "read",
    },
  ],
};

const messageTemplates = [
  {
    id: "follow-up",
    label: "Follow-up",
    message:
      "Hi! I wanted to follow up and see if you had a chance to review the proposal.",
  },
  {
    id: "meeting",
    label: "Schedule meeting",
    message:
      "Would you be available for a short call this week? Please let me know what time works best.",
  },
  {
    id: "proposal",
    label: "Send proposal",
    message:
      "Hi! I have prepared the updated proposal. Let me know when you are available to review it.",
  },
  {
    id: "thank-you",
    label: "Thank you",
    message:
      "Thank you for your time today. I will send you the next steps shortly.",
  },
];

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const formatMessageTime = (timestamp) =>
  new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

const formatConversationTime = (timestamp) => {
  if (!timestamp) {
    return "";
  }

  const messageDate = new Date(timestamp);
  const today = new Date();

  const isToday =
    messageDate.toDateString() === today.toDateString();

  if (isToday) {
    return formatMessageTime(timestamp);
  }

  return messageDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

function WhatsApp() {
  const toast = useToast();
  const messagesEndRef = useRef(null);

  const contacts = useMemo(() => {
    const storedContacts = readStoredArray(
      "flowcrm-contacts"
    );

    return storedContacts.length > 0
      ? storedContacts
      : fallbackContacts;
  }, []);

  const [conversations, setConversations] =
    useState(() => {
      const savedMessages = localStorage.getItem(
        "flowcrm-whatsapp-messages"
      );

      if (savedMessages) {
        try {
          const parsedMessages =
            JSON.parse(savedMessages);

          if (
            parsedMessages &&
            typeof parsedMessages === "object"
          ) {
            return parsedMessages;
          }
        } catch {
          return initialMessages;
        }
      }

      return initialMessages;
    });

  const [selectedContactId, setSelectedContactId] =
    useState(() => contacts[0]?.id ?? null);

  const [searchTerm, setSearchTerm] = useState("");
  const [messageText, setMessageText] = useState("");
  const [showTemplates, setShowTemplates] =
    useState(false);
  const [showMobileChat, setShowMobileChat] =
    useState(false);

  useEffect(() => {
    localStorage.setItem(
      "flowcrm-whatsapp-messages",
      JSON.stringify(conversations)
    );
  }, [conversations]);

  const selectedContact = contacts.find(
    (contact) =>
      String(contact.id) ===
      String(selectedContactId)
  );

  const selectedMessages =
    conversations[selectedContactId] || [];

  const conversationRecords = useMemo(() => {
    return contacts
      .map((contact) => {
        const contactMessages =
          conversations[contact.id] || [];

        const lastMessage =
          contactMessages[
            contactMessages.length - 1
          ];

        const unreadCount = contactMessages.filter(
          (message) =>
            message.sender === "contact" &&
            message.status !== "read"
        ).length;

        return {
          contact,
          messages: contactMessages,
          lastMessage,
          unreadCount,
        };
      })
      .sort((firstConversation, secondConversation) => {
        const firstTimestamp =
          firstConversation.lastMessage?.timestamp ||
          "";

        const secondTimestamp =
          secondConversation.lastMessage?.timestamp ||
          "";

        return secondTimestamp.localeCompare(
          firstTimestamp
        );
      });
  }, [contacts, conversations]);

  const filteredConversations = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase();

    if (!normalizedSearch) {
      return conversationRecords;
    }

    return conversationRecords.filter(
      ({ contact, lastMessage }) => {
        const searchableText = [
          contact.name,
          contact.company,
          contact.phone,
          lastMessage?.text,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(
          normalizedSearch
        );
      }
    );
  }, [conversationRecords, searchTerm]);

  const markConversationAsRead = (contactId) => {
    setConversations((currentConversations) => ({
      ...currentConversations,
      [contactId]: (
        currentConversations[contactId] || []
      ).map((message) =>
        message.sender === "contact"
          ? {
              ...message,
              status: "read",
            }
          : message
      ),
    }));
  };

  const openConversation = (contactId) => {
    setSelectedContactId(contactId);
    setShowMobileChat(true);
    setShowTemplates(false);
    markConversationAsRead(contactId);
  };

  const sendMessage = (event) => {
    event.preventDefault();

    const trimmedMessage = messageText.trim();

    if (!selectedContact) {
      toast.warning(
        "Select a contact",
        "Choose a conversation before sending a message."
      );
      return;
    }

    if (!trimmedMessage) {
      toast.warning(
        "Message is empty",
        "Write a message before sending it."
      );
      return;
    }

    const newMessage = {
      id: Date.now(),
      sender: "user",
      text: trimmedMessage,
      timestamp: new Date().toISOString(),
      status: "sent",
    };

    setConversations((currentConversations) => ({
      ...currentConversations,
      [selectedContact.id]: [
        ...(currentConversations[
          selectedContact.id
        ] || []),
        newMessage,
      ],
    }));

    setMessageText("");
    setShowTemplates(false);

    toast.success(
      "Message sent",
      `Your message was sent to ${selectedContact.name}.`
    );
  };

  const useTemplate = (templateMessage) => {
    setMessageText(templateMessage);
    setShowTemplates(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [selectedContactId, selectedMessages.length]);
  return (
    <div className="whatsapp-page">
      <section className="whatsapp-page__header">
        <div>
          <h1>WhatsApp</h1>

          <p>
            Manage customer conversations and follow-ups
            from one inbox.
          </p>
        </div>

        <div className="whatsapp-page__connection">
          <span />
          WhatsApp connected
        </div>
      </section>

      <section className="whatsapp-workspace">
        <aside
          className={`whatsapp-sidebar ${
            showMobileChat
              ? "whatsapp-sidebar--hidden-mobile"
              : ""
          }`}
        >
          <div className="whatsapp-sidebar__header">
            <div>
              <h2>Conversations</h2>

              <span>
                {conversationRecords.length} contacts
              </span>
            </div>

            <MessageCircle size={20} />
          </div>

          <div className="whatsapp-sidebar__search">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />
          </div>

          <div className="whatsapp-sidebar__list">
            {filteredConversations.length === 0 ? (
              <div className="whatsapp-sidebar__empty">
                <Search size={27} />
                <p>No conversations found.</p>
              </div>
            ) : (
              filteredConversations.map(
                ({
                  contact,
                  lastMessage,
                  unreadCount,
                }) => (
                  <button
                    type="button"
                    className={`whatsapp-conversation ${
                      String(selectedContactId) ===
                      String(contact.id)
                        ? "whatsapp-conversation--active"
                        : ""
                    }`}
                    key={contact.id}
                    onClick={() =>
                      openConversation(contact.id)
                    }
                  >
                    <div className="whatsapp-avatar">
                      {getInitials(contact.name)}

                      <span className="whatsapp-avatar__status" />
                    </div>

                    <div className="whatsapp-conversation__content">
                      <div>
                        <strong>{contact.name}</strong>

                        <time>
                          {formatConversationTime(
                            lastMessage?.timestamp
                          )}
                        </time>
                      </div>

                      <div>
                        <p>
                          {lastMessage?.sender ===
                            "user" && (
                            <CheckCheck size={13} />
                          )}

                          <span>
                            {lastMessage?.text ||
                              "Start a conversation"}
                          </span>
                        </p>

                        {unreadCount > 0 && (
                          <span className="whatsapp-conversation__unread">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              )
            )}
          </div>
        </aside>

        <main
          className={`whatsapp-chat ${
            showMobileChat
              ? "whatsapp-chat--visible-mobile"
              : ""
          }`}
        >
          {!selectedContact ? (
            <div className="whatsapp-chat__empty">
              <div>
                <MessageCircle size={35} />
              </div>

              <h2>Select a conversation</h2>

              <p>
                Choose a contact to view the conversation
                and send messages.
              </p>
            </div>
          ) : (
            <>
              <header className="whatsapp-chat__header">
                <button
                  type="button"
                  className="whatsapp-chat__back"
                  aria-label="Return to conversations"
                  onClick={() =>
                    setShowMobileChat(false)
                  }
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="whatsapp-avatar">
                  {getInitials(selectedContact.name)}

                  <span className="whatsapp-avatar__status" />
                </div>

                <div className="whatsapp-chat__identity">
                  <strong>
                    {selectedContact.name}
                  </strong>

                  <span>
                    {selectedContact.company ||
                      selectedContact.phone ||
                      "CRM contact"}
                  </span>
                </div>

                <button
                  type="button"
                  className="whatsapp-chat__more"
                  aria-label="Conversation options"
                >
                  <MoreVertical size={20} />
                </button>
              </header>

              <div className="whatsapp-chat__messages">
                <div className="whatsapp-chat__date">
                  Today
                </div>

                {selectedMessages.length === 0 ? (
                  <div className="whatsapp-chat__no-messages">
                    <UserRound size={31} />

                    <h3>
                      Start your conversation with{" "}
                      {selectedContact.name}
                    </h3>

                    <p>
                      Select a template or write your own
                      message below.
                    </p>
                  </div>
                ) : (
                  selectedMessages.map((message) => (
                    <article
                      className={`whatsapp-message whatsapp-message--${message.sender}`}
                      key={message.id}
                    >
                      <p>{message.text}</p>

                      <footer>
                        <time>
                          {formatMessageTime(
                            message.timestamp
                          )}
                        </time>

                        {message.sender === "user" && (
                          <CheckCheck size={14} />
                        )}
                      </footer>
                    </article>
                  ))
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="whatsapp-composer">
                {showTemplates && (
                  <div className="whatsapp-templates">
                    <div className="whatsapp-templates__header">
                      <div>
                        <strong>
                          Message templates
                        </strong>

                        <span>
                          Select a reusable response
                        </span>
                      </div>
                    </div>

                    <div className="whatsapp-templates__list">
                      {messageTemplates.map(
                        (template) => (
                          <button
                            type="button"
                            key={template.id}
                            onClick={() =>
                              useTemplate(
                                template.message
                              )
                            }
                          >
                            <strong>
                              {template.label}
                            </strong>

                            <span>
                              {template.message}
                            </span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}

                <form onSubmit={sendMessage}>
                  <button
                    type="button"
                    aria-label="Attach a file"
                  >
                    <Paperclip size={19} />
                  </button>

                  <div className="whatsapp-composer__input">
                    <textarea
                      rows="1"
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(event) =>
                        setMessageText(
                          event.target.value
                        )
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" &&
                          !event.shiftKey
                        ) {
                          event.preventDefault();
                          sendMessage(event);
                        }
                      }}
                    />

                    <button
                      type="button"
                      aria-label="Open message templates"
                      onClick={() =>
                        setShowTemplates(
                          (currentValue) =>
                            !currentValue
                        )
                      }
                    >
                      <Clock3 size={18} />
                    </button>

                    <button
                      type="button"
                      aria-label="Add emoji"
                    >
                      <Smile size={18} />
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="whatsapp-composer__send"
                    aria-label="Send message"
                  >
                    <Send size={19} />
                  </button>
                </form>

                <p>
                  Messages are simulated and stored locally
                  for this portfolio demonstration.
                </p>
              </div>
            </>
          )}
        </main>
      </section>
    </div>
  );
}

export default WhatsApp;