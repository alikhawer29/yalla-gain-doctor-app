import { useEffect, useRef, useState } from "react";
import { FlatList } from "react-native";
import { useSelector } from "react-redux";
import { useCreateConversationMutation, useEndSessionMutation, useSendQuestionMutation } from "../../redux/Apis/Chatbot";
import { selectUser } from "../../redux/Slices/AuthSlice";
import { TMessage } from "../../interfaces";
import {
    clearChatbotSession,
    loadChatbotSession,
    restoreChatbotMessages,
    saveChatbotSession,
} from "../../utils/chatbotSession";

const INITIAL_MESSAGE: TMessage = {
    id: '1',
    text: "Hi there! 👋 Yalla AI is here. How can I help you today?",
    sender: 'bot',
    timestamp: null,
}

const useChatbotController = () => {

    const flatlist_ref = useRef<FlatList>(null)
    const user = useSelector(selectUser)
    const sessionStartedAtRef = useRef<number | null>(null)

    const [createConversation] = useCreateConversationMutation();
    const [send, { data: sendData, isLoading: isSendLoading, isSuccess: isSendSuccess }] = useSendQuestionMutation();
    const [endSession] = useEndSessionMutation();

    const [sessionId, setSessionId] = useState<string | null>(null)
    const [sessionReady, setSessionReady] = useState(false)
    const [messages, setMessages] = useState<TMessage[]>([INITIAL_MESSAGE])
    const [input, setInput] = useState("")

    const persistSession = async (nextMessages: TMessage[], activeSessionId: string) => {
        if (!user?.id || !sessionStartedAtRef.current) return
        await saveChatbotSession(user.id, {
            session_id: activeSessionId,
            started_at: sessionStartedAtRef.current,
            messages: nextMessages,
        })
    }

    useEffect(() => {
        if (flatlist_ref.current) {
            flatlist_ref.current.scrollToEnd({ animated: true });
        }
    }, [messages])

    useEffect(() => {
        if (!user?.id) return

        let cancelled = false

        const initSession = async () => {
            const stored = await loadChatbotSession(user.id)

            if (cancelled) return

            if (stored) {
                sessionStartedAtRef.current = stored.started_at
                setSessionId(stored.session_id)
                setMessages(restoreChatbotMessages(stored, INITIAL_MESSAGE))
                setSessionReady(true)
                return
            }

            try {
                const result = await createConversation({ visitor_id: user.id }).unwrap()
                if (cancelled) return

                const newSessionId = result?.session_id
                if (!newSessionId) {
                    setSessionReady(true)
                    return
                }

                sessionStartedAtRef.current = Date.now()
                setSessionId(newSessionId)
                setMessages([INITIAL_MESSAGE])
                await saveChatbotSession(user.id, {
                    session_id: newSessionId,
                    started_at: sessionStartedAtRef.current,
                    messages: [INITIAL_MESSAGE],
                })
                setSessionReady(true)
            } catch {
                if (!cancelled) setSessionReady(true)
            }
        }

        initSession()

        return () => {
            cancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id])

    useEffect(() => {
        if (!isSendSuccess || !sendData) return

        const botText =
            typeof sendData === 'string'
                ? sendData
                : (sendData as { text?: string })?.text ?? String(sendData)

        setMessages(prev => {
            const withoutTyping = prev.filter(m => !m.typing)
            const new_message: TMessage = {
                id: Date.now().toString(),
                text: botText,
                sender: "bot",
                timestamp: new Date()
            }
            const next = [...withoutTyping, new_message]
            if (sessionId) persistSession(next, sessionId)
            return next
        })

    }, [isSendSuccess, sendData, sessionId])

    useEffect(() => {
        if (!isSendLoading) return

        const new_message: TMessage = {
            id: Date.now().toString(),
            sender: "bot",
            timestamp: null,
            typing: true,
            text: ""
        }

        const timer = setTimeout(() => {
            setMessages((prev) => [...prev, new_message])
        }, 500)

        return () => clearTimeout(timer)
    }, [isSendLoading])

    const onSendMessage = () => {
        if (input.trim() === "" || !sessionId || !sessionReady) return;

        const new_message: TMessage = {
            id: Date.now().toString(),
            text: input,
            sender: "me",
            timestamp: new Date()
        }

        const question = input.trim()
        setMessages((prev) => {
            const next = [...prev, new_message]
            persistSession(next, sessionId)
            return next
        })
        setInput("")

        send({ session_id: sessionId, question });
    }

    useEffect(() => {
        return () => {
            if (!user?.id || !sessionId || !sessionStartedAtRef.current) return
            const startedAt = sessionStartedAtRef.current
            const elapsed = Date.now() - startedAt
            const SESSION_MS = 10 * 60 * 1000
            if (elapsed >= SESSION_MS) {
                endSession({ session_id: sessionId, visitor_id: user.id }).catch(() => {})
                clearChatbotSession(user.id).catch(() => {})
            }
        }
    }, [user?.id, sessionId, endSession])

    return {
        refs: {
            flatlist_ref
        },
        values: {
            data: messages,
            input,
            sessionReady,
            userPhoto: user?.photo ?? null,
        },
        functions: {
            onSendMessage,
            onChangeInput: setInput
        }
    }

}

export default useChatbotController
