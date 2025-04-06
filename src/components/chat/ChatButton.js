import { useEffect, useState, useContext } from 'react';
import { useDispatch, useSelector } from "react-redux";
import ChatContent from './ChatContent';
import { motion, AnimatePresence } from 'framer-motion';
import { FaComment, FaTimes, FaRegBell } from 'react-icons/fa';
import { ChatContext } from '../context/showChat';

const ChatButton = (props) => {
    const { product } = props;
    const [newMessagesCount, setNewMessagesCount] = useState(0);
    const [unreadUsers, setUnreadUsers] = useState([]);
    const dispatch = useDispatch();
    const { showChat, setShowChat, selectedUser, setSelectedUser, setOwner } = useContext(ChatContext);

    // Bounce animation for new messages
    const bounceVariants = {
        initial: { scale: 1 },
        animate: {
            scale: [1, 1.2, 1],
            transition: {
                duration: 0.5,
                repeat: newMessagesCount > 0 ? 2 : 0,
                repeatType: "reverse"
            }
        }
    };

    // Slide and fade animations for chat window
    const chatWindowVariants = {
        hidden: {
            opacity: 0,
            y: 20,
            scale: 0.95,
            transition: { duration: 0.2 }
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 24,
                duration: 0.3
            }
        }
    };

    return (
        <>
            {/* Chat Button */}
            <AnimatePresence>
                {!showChat && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                        className="fixed bottom-6 right-6 z-50"
                    >
                        <motion.button
                            variants={bounceVariants}
                            initial="initial"
                            animate={newMessagesCount > 0 ? "animate" : "initial"}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowChat(true)}
                            className="relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg transition-all duration-300"
                            aria-label="Open chat"
                        >
                            <FaComment className="text-2xl" />

                            {/* Message Counter Badge */}
                            {newMessagesCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md"
                                >
                                    {newMessagesCount}
                                </motion.span>
                            )}
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Content */}
            <AnimatePresence>
                {showChat && (
                    <motion.div
                        key="chat-window"
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={chatWindowVariants}
                        className="fixed bottom-0 right-0 z-50 w-full md:w-auto"
                    >
                        <ChatContent
                            showChat={showChat}
                            setShowChat={setShowChat}
                            setNewMessagesCount={setNewMessagesCount}
                            newMessagesCount={newMessagesCount}
                            product={product}
                            unreadUsers={unreadUsers}
                            setUnreadUsers={setUnreadUsers}
                            selectedUser={selectedUser}
                            setSelectedUser={setSelectedUser}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatButton;
