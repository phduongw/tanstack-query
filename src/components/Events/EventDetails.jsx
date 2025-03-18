import {Link, Outlet, useParams} from 'react-router-dom';
import {useMutation, useQuery} from "@tanstack/react-query";
import {useNavigate} from "react-router-dom";
import {useState} from "react";

import Header from '../Header.jsx';
import {deleteEvent, fetchEvent, queryClient} from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import Modal from "../UI/Modal.jsx";

export default function EventDetails() {
    const navigate = useNavigate();
    const [isDeleting, setDeleting] = useState(false);
    const {id} = useParams();
    const {data, isPending, isError, error} = useQuery({
        queryKey: ['events', id],
        queryFn: ({signal}) => fetchEvent({id, signal}),
        staleTime: 5000,
    });

    const {mutate, isPending: isPendingDelete, isError: isErrorDelete, error: errorDelete} = useMutation({
        mutationFn: () => deleteEvent({id}),
        onSuccess: () => {
            // Because we invalidated all event related queries based on queryKey.
            // And we still were on this page. Therefore, when we invalidated all queries,
            // React query will go ahead and immediately trigger a refresh useQuery depend on query key on this page
            queryClient.invalidateQueries({
                queryKey: ['events'],
                refetchType: 'none' // Make sure when we call invalidate queries, these existing query with same queryKey on this page will not automatically be triggered again immediately.
            })
            navigate('/events')
        }
    });


    function handleStartDelete() {
        setDeleting(true)
    }

    function handleStopDelete() {
        setDeleting(false)
    }

    let content;
    if (isPending) {
        content = <div id="event-details-content" className="center">
            <p>Fetching event data...</p>
        </div>
    }

    if (isError) {
        content = <div id="event-details-content" className="center">
            <ErrorBlock title="Failed to load event" message={error.info?.message || 'Failed to fetch events.'}/>
        </div>
    }

    if (data) {
        const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
        content = <div id="event-details-content">
            <img src={`http://localhost:3000/${data.image}`} alt={data.title}/>
            <div id="event-details-info">
                <div>
                    <p id="event-details-location">{data.location}</p>
                    <time dateTime={`Todo-DateT$Todo-Time`}>{formattedDate} @ {data.time}</time>
                </div>
                <p id="event-details-description">{data.description}</p>
            </div>
        </div>
    }

    return (
        <>
            {isDeleting && <Modal onClose={handleStopDelete}>
                <h2>Are you sure?</h2>
                <p>Do you really wanna delete this event? This action cannot be undone</p>
                <div className="form-actions">
                    <button onClick={handleStopDelete} className="button-text">Cancel</button>
                    <button onClick={mutate} className="button">Delete</button>
                </div>
                {isPendingDelete && <p>Deleting event...</p>}
                {isErrorDelete && <ErrorBlock title="Deleting event failed"
                                              message={errorDelete.info?.message || 'Failed to delete event'}/>}
            </Modal>}
            <Outlet/>
            <Header>
                <Link to="/events" className="nav-item">
                    View all Events
                </Link>
            </Header>
            <article id="event-details">
                <header>
                    <h1>{data && data.title}</h1>
                    <nav>
                        <button onClick={handleStartDelete}>Delete</button>
                        <Link to="edit">Edit</Link>
                    </nav>
                </header>
                {content}
            </article>
        </>
    );
}
