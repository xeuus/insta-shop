import './Card.scss';
import React, {PureComponent} from 'react';
import {formatNumber, formatRelative} from "./FormattingTools";

export interface Comment {
  username: string;
  message: string;

}

export interface Card {
  id: number;
  liked: boolean;
  saved: boolean;
  username: string;
  avatar: string;
  totalLikes: number;
  totalComments: number;
  comments: Comment[];
  images: string[];
  createdDate: string;
}

export interface CardProps {
  item: Card;
}

export class CardView extends PureComponent<CardProps> {
  state = {
    liked: this.props.item.liked,
    saved: this.props.item.saved,
  };
  toggleLike = () => this.setState({liked: !this.state.liked});
  toggleSave = () => this.setState({saved: !this.state.saved});

  render() {
    const {item} = this.props;
    const {liked, saved} = this.state;
    return <div className="card" data-id={item.id}>
      <div className="card-header">
        <a href="#" className="avatar">
          <img src={item.avatar}/>
        </a>
        <a href="#">{item.username}</a>
        <div className="menu">
          <span className="icon"/>
        </div>
      </div>
      <div className="card-image">
        <img src={item.images[0]}/>
      </div>
      <div className="card-actions">
        <div className="like" data-active={liked} onClick={this.toggleLike}>
          <span className="icon"/>
        </div>
        <a href="#" className="comment">
          <span className="icon"/>
        </a>
        <div className="save" data-active={saved} onClick={this.toggleSave}>
          <span className="icon"/>
        </div>
      </div>
      <a href="#" className="likes-count">
        <span>{formatNumber(item.totalLikes)}</span>&nbsp;<span>likes</span>
      </a>
      <a href="#" className="all-comments">
        <span>View all</span>&nbsp;
        <span>{formatNumber(item.totalComments)}</span>&nbsp;
        <span>comments</span>
      </a>
      {item.comments.map((comment, i) => {
        return <label key={i} className="comment">
          <a href="#">{comment.username}</a>
          <span>{comment.message}</span>
        </label>;
      })}
      <span className="created-date">{formatRelative(item.createdDate)}</span>
    </div>
  }
}