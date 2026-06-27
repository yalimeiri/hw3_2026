import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Note from '../components/Note';
import Pagination from '../components/Pagination';
import AddNote from '../components/AddNote';
import { useNotes } from '../contexts/NotesContext';
import { useAuth } from '../contexts/AuthContext';
import api, { NOTES_URL, POSTS_PER_PAGE } from '../utils/api';
import { getVisiblePages } from '../utils/getVisiblePages';

const HomePage = () => {
  const { state, dispatch } = useNotes();
  const { notes, currentPage, totalPages, notification, cache } = state;
  const { isLoggedIn, logout } = useAuth();
  const [refresh, setRefresh] = useState(0);
  // Whether note bodies are run through the sanitizer before being injected as
  // HTML. Defaults to ON (safe). State only: a refresh resets it back to ON.
  const [sanitizerOn, setSanitizerOn] = useState(true);

  const fetchPage = useCallback(async (page: number) => {
    const response = await api.get(NOTES_URL, {
      params: {
        _page: page,
        _per_page: POSTS_PER_PAGE,
      },
    });

    const totalItems = Number(response.headers['x-total-count']);
    const total = Math.ceil(totalItems / POSTS_PER_PAGE);

    return {
      notes: response.data,
      totalPages: total,
    };
  }, []);

  const prefetchVisiblePages = useCallback(async (
    page: number,
    total: number,
    currentCache: Record<number, typeof notes>,
  ) => {
    const visiblePages = getVisiblePages(page, total);
    const pagesToFetch = visiblePages.filter((visiblePage) => !currentCache[visiblePage]);

    await Promise.all(
      pagesToFetch.map(async (visiblePage) => {
        const pageData = await fetchPage(visiblePage);
        dispatch({
          type: 'CACHE_PAGE',
          payload: { page: visiblePage, notes: pageData.notes },
        });
      }),
    );
  }, [dispatch, fetchPage]);

  useEffect(() => {
    let isActive = true;

    const loadNotes = async () => {
      try {
        if (cache[currentPage]) {
          dispatch({ type: 'SET_CURRENT_NOTES', payload: cache[currentPage] });
        } else {
          const pageData = await fetchPage(currentPage);
          if (!isActive) {
            return;
          }

          dispatch({
            type: 'SET_NOTES',
            payload: {
              notes: pageData.notes,
              totalPages: pageData.totalPages,
            },
          });
          dispatch({
            type: 'CACHE_PAGE',
            payload: { page: currentPage, notes: pageData.notes },
          });

          const nextCache = {
            ...cache,
            [currentPage]: pageData.notes,
          };
          await prefetchVisiblePages(currentPage, pageData.totalPages, nextCache);
          return;
        }

        if (totalPages > 0) {
          await prefetchVisiblePages(currentPage, totalPages, cache);
        }
      } catch (error) {
        console.error('Encountered an error:', error);
      }
    };

    loadNotes();

    return () => {
      isActive = false;
    };
  }, [cache, currentPage, dispatch, fetchPage, prefetchVisiblePages, refresh, totalPages]);

  useEffect(() => {
    if (notification !== 'Notification area') {
      const timeoutId = setTimeout(() => {
        dispatch({ type: 'SET_NOTIFICATION', payload: null });
      }, 3000);

      return () => clearTimeout(timeoutId);
    }
  }, [dispatch, notification]);

  const triggerRefresh = () => {
    dispatch({ type: 'CLEAR_CACHE' });
    setRefresh((previous) => previous + 1);
  };

  const handlePageChange = (page: number) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  };

  return (
    <div>
      <div className="home-nav">
        {isLoggedIn ? (
          <button data-testid="logout" className="neon-btn" onClick={logout}>
            Logout
          </button>
        ) : (
          <>
            <Link to="/login">
              <button data-testid="go_to_login_button" className="neon-btn">
                Go to Login
              </button>
            </Link>
            <Link to="/create-user">
              <button data-testid="go_to_create_user_button" className="neon-btn">
                Create New User
              </button>
            </Link>
          </>
        )}
      </div>

      {notification && notification !== 'Notification area' && (
        <div className="notification">{notification}</div>
      )}

      <div className="home-nav">
        <button
          data-testid="sanitizer_toggle"
          className="neon-btn"
          onClick={() => setSanitizerOn((previous) => !previous)}
        >
          {sanitizerOn ? 'Sanitizer: ON' : 'Sanitizer: OFF'}
        </button>
      </div>

      {isLoggedIn && <AddNote onSuccess={triggerRefresh} />}

      {notes.map((note) => (
        <Note key={note._id} note={note} onSuccess={triggerRefresh} sanitize={sanitizerOn} />
      ))}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default HomePage;
